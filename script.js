const USER = "xavier-db";
const REPO = "my-site";
const contactEmail = "elysian.magazine.official@gmail.com";

// CUSTOM STAFF WORK ORDER
const customOrder = [
    "J.S.Lynn",
    "Yazia Inara"
];

// CACHED FETCH

const CACHE_PREFIX = "ghcache:";
const DEFAULT_TTL_MINUTES = 30;

async function cachedFetch(url, ttlMinutes = DEFAULT_TTL_MINUTES) {
    const cacheKey = CACHE_PREFIX + url;

    let cachedEntry = null;
    try {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) cachedEntry = JSON.parse(cached);
    } catch {}

    if (cachedEntry && (Date.now() - cachedEntry.timestamp < ttlMinutes * 60 * 1000)) {
        return cachedEntry.data;
    }

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`Fetch failed: ${res.status} for ${url}`);

        const contentType = res.headers.get("content-type") || "";
        const data = contentType.includes("application/json")
            ? await res.json()
            : await res.text();

        try {
            sessionStorage.setItem(cacheKey, JSON.stringify({ timestamp: Date.now(), data }));
        } catch {
            // sessionStorage may be full or unavailable
        }

        return data;
    } catch (err) {
        if (cachedEntry) {
            return cachedEntry.data;
        }
        throw err;
    }
}

// HEADER SCROLL

const header = document.querySelector("header");

let lastScroll = window.scrollY;
let target = 0;
let current = 0;

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

window.addEventListener("scroll", () => {
    const currentScroll = Math.max(0, window.scrollY);

    const diff = currentScroll - lastScroll;

    target -= diff;

    const maxHide = header.offsetHeight;

    target = clamp(target, -maxHide, 0);

    lastScroll = currentScroll;
});

function animate() {
    current += (target - current) * 0.15;

    header.style.transform = `translateY(${current}px)`;

    requestAnimationFrame(animate);
}

animate();

// Repo replacement

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".siteRepo").forEach(el => {
        if (el.href.includes("siteRepo")) {
            el.href = el.href.replace("siteRepo", REPO);
        }
    });

    const contactForm = document.querySelector(".contactForm");
    if (contactForm) {
        contactForm.action = `https://formsubmit.co/${contactEmail}`;
    }
});

const magazinesContainer = document.getElementById("magazines");

document.addEventListener("click", (e) => {
    const header = e.target.closest(".article-accordion-header");
    if (!header) return;

    header.classList.toggle("open");
    header.nextElementSibling?.classList.toggle("open");
});

async function buildArticlesHTML(files, excludeNames = ["description.txt"]) {
    if (!Array.isArray(files)) return "";

    const articleFiles = files.filter(f =>
        f.type === "file" &&
        /\.txt$/i.test(f.name) &&
        !excludeNames.includes(f.name)
    );

    if (articleFiles.length === 0) return "";

    let itemsHTML = "";

    for (const file of articleFiles) {
        let text = "";
        try {
            text = await cachedFetch(file.download_url);
        } catch {
            continue;
        }

        const lines = text.split("\n");
        const title = (lines[0] || file.name.replace(/\.txt$/i, "")).trim() || file.name.replace(/\.txt$/i, "");
        const body = lines.slice(1).join("\n").trim();

        itemsHTML += `
            <div class="article-accordion-item">
                <button type="button" class="article-accordion-header">${title}</button>
                <div class="article-accordion-body">
                    <p>${body.replace(/\n/g, "<br>")}</p>
                </div>
            </div>
        `;
    }

    return itemsHTML ? `<div class="article-accordion">${itemsHTML}</div>` : "";
}

// MAGAZINES

async function loadMagazines() {

    const folders = await cachedFetch(
        `https://api.github.com/repos/${USER}/${REPO}/contents/magazines`
    );

    if (!Array.isArray(folders)) return;

    for (const folder of folders) {

        if (folder.type !== "dir") continue;
        if (folder.name === "magazine-reference (DO NOT DELETE)") continue;

        const files = await cachedFetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${folder.name}`
        );

        const infoFile = files.find(f => f.name === "description.txt");

        let description = "";

        if (infoFile) {
            description = await cachedFetch(infoFile.download_url);
        }

        const anchor = document.createElement("a");
        anchor.href = `magazines/${folder.name}/`;
        anchor.className = "magazine-card";

        anchor.innerHTML = `
            <h2>${folder.name}</h2>
            <p>${description}</p>
        `;

        magazinesContainer.appendChild(anchor);
    }
}

if (magazinesContainer) loadMagazines();


// MAGAZINE PAGE

async function loadMagazinePage() {

    const magazineNameElement = document.getElementById("magazine-name");
    const descriptionElement = document.querySelector(".description");
    const heroElement = document.querySelector(".hero");

    if (!magazineNameElement || !descriptionElement) return;

    const parts = window.location.pathname.split("/").filter(Boolean);
    const magazineIndex = parts.indexOf("magazines");

    if (magazineIndex === -1 || !parts[magazineIndex + 1]) return;

    const folderName = decodeURIComponent(parts[magazineIndex + 1]);
    const displayName = folderName.replace(/-/g, " ");

    magazineNameElement.textContent = displayName;
    document.title = `${displayName} | Elysian: To Be Seen`;

    try {
        const files = await cachedFetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${folderName}`
        );

        const imageFile = files.find(f =>
            f.name.match(/\.(png|jpg|jpeg|webp|gif)$/i)
        );

        if (imageFile && heroElement) {
            heroElement.style.backgroundImage = `url(${imageFile.download_url})`;
        }

        descriptionElement.textContent = await cachedFetch(
            `https://raw.githubusercontent.com/${USER}/${REPO}/main/magazines/${folderName}/description.txt`
        );

    } catch {
        descriptionElement.textContent = "No description available.";
    }
}

loadMagazinePage();


// CATEGORY SYSTEM

const categoriesContainer = document.getElementById("categories");
const piecesContainer = document.getElementById("pieces");
const categoryTitle = document.getElementById("category-title");

let categoryOpen = false;

function showCategories() {
    categoryOpen = false;
    categoriesContainer.style.display = "grid";
    const categoryView = document.getElementById("category-view");
    if (categoryView) categoryView.style.display = "none";
}

document.getElementById("back-button")?.addEventListener("click", () => {
    if (categoryOpen) {
        showCategories();
    } else {
        history.back();
    }
});

const categoryView = document.getElementById("category-view");
if (categoryView) categoryView.style.display = "none";


// LOAD CATEGORIES

async function loadCategories() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const magazineIndex = parts.indexOf("magazines");
    const folderName = decodeURIComponent(parts[magazineIndex + 1]);

    const items = await cachedFetch(
        `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${folderName}`
    );

    if (!Array.isArray(items)) return;

    for (const item of items) {

        if (item.type !== "dir") continue;

        const categoryFiles = await cachedFetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${folderName}/${item.name}`
        );

        const descFile = categoryFiles.find(f => f.name === "description.txt");

        let description = "";

        if (descFile) {
            description = await cachedFetch(descFile.download_url);
        }

        const card = document.createElement("a");
        card.className = "magazine-card";
        card.href = "#";

        card.innerHTML = `
            <h2>${item.name}</h2>
            <p>${description}</p>
        `;

        card.addEventListener("click", (e) => {
            e.preventDefault();

            categoryOpen = true;
            document.getElementById("category-view").style.display = "block";
            categoriesContainer.style.display = "none";

            loadCategory(folderName, item.name);
        });

        categoriesContainer.appendChild(card);
    }

    const staticPages = [
        {
            href: `/${REPO}/creative-person-of-the-week/index.html`,
            title: "Creative Person of the Week",
            description: "Weekly highlight of a standout artist, with a brief Q&A."
        },
        {
            href: `/${REPO}/guide.html`,
            title: "Guide & Rules",
            description: "How to pitch or submit work, our editorial standards, and community values."
        }
    ];

    for (const page of staticPages) {
        const card = document.createElement("a");
        card.className = "magazine-card";
        card.href = page.href;
        card.innerHTML = `<h2>${page.title}</h2><p>${page.description}</p>`;
        categoriesContainer.appendChild(card);
    }
}

if (categoriesContainer) loadCategories();


// LOAD CATEGORY

async function loadCategory(magazineName, categoryName) {

    piecesContainer.innerHTML = "";
    categoryTitle.textContent = categoryName;

    try {

        const items = await cachedFetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${magazineName}/${categoryName}`
        );

        if (!Array.isArray(items)) return;

        for (const item of items) {

            if (item.type !== "dir") continue;

            const files = await cachedFetch(
                `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${magazineName}/${categoryName}/${item.name}`
            );

            const descriptionFile = files.find(f => f.name === "description.txt");

            let description = "";

            if (descriptionFile) {
                description = await cachedFetch(descriptionFile.download_url);
            }

            const mediaFiles = files.filter(f =>
                f.name.match(/\.(png|jpg|jpeg|webp|gif|mp4|webm|mov|mp3|wav|ogg|flac|m4a)$/i)
            );

            let mediaHTML = "";

            for (const media of mediaFiles) {

                if (media.name.match(/\.(png|jpg|jpeg|webp|gif)$/i)) {
                    mediaHTML += `<img src="${media.download_url}" alt="${media.name}">`;
                }

                if (media.name.match(/\.(mp4|webm|mov)$/i)) {
                    mediaHTML += `
                        <video controls>
                            <source src="${media.download_url}">
                        </video>
                    `;
                }

                if (media.name.match(/\.(mp3|wav|ogg|flac|m4a)$/i)) {
                    mediaHTML += `
                        <audio controls>
                            <source src="${media.download_url}">
                        </audio>
                    `;
                }
            }

            const articlesHTML = await buildArticlesHTML(files);

            const card = document.createElement("div");
            card.className = "piece-card";

            card.innerHTML = `
                <h3>${item.name}</h3>
                <p>${description}</p>
                ${mediaHTML}
            `;

            piecesContainer.appendChild(card);
        }

    } catch (error) {
        console.error("Failed loading category", error);
    }
}

// STAFF WORKS
let staffContainer;

document.addEventListener("DOMContentLoaded", () => {
    staffContainer = document.getElementById("staff-container");
    if (!staffContainer) return;

    loadStaffList();
});

async function loadStaffList() {
    const folders = await cachedFetch(
        `https://api.github.com/repos/${USER}/${REPO}/contents/staffs-work`
    );

    if (!Array.isArray(folders)) return;

    folders.sort((a, b) => {

        const aIndex = customOrder.indexOf(a.name);
        const bIndex = customOrder.indexOf(b.name);

        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }

        if (aIndex !== -1) return -1;

        if (bIndex !== -1) return 1;

        // Fallback alphabetical
        return a.name.localeCompare(b.name);
    });

    for (const folder of folders) {
        if (folder.type !== "dir") continue;

        let description = "";

        try {
            description = await cachedFetch(
                `https://raw.githubusercontent.com/${USER}/${REPO}/main/staffs-work/${folder.name}/description.txt`
            );
        } catch {}

        let coverUrl = null;

        try {
            const files = await cachedFetch(
                `https://api.github.com/repos/${USER}/${REPO}/contents/staffs-work/${folder.name}`
            );
            if (Array.isArray(files)) {
                const coverFile = files.find(f =>
                    f.type === "file" && /^cover\.(png|jpe?g|webp|gif)$/i.test(f.name)
                );
                if (coverFile) coverUrl = coverFile.download_url;
            }
        } catch {}

        const card = document.createElement("a");

        card.href = `staffs-work/${folder.name}/index.html`;
        card.className = coverUrl ? "magazine-card staff-card-cover" : "magazine-card";

        if (coverUrl) {
            card.style.backgroundImage = `url(${coverUrl})`;
        }

        card.innerHTML = `
            <h2>${folder.name.replace(/-/g, " ")}</h2>
            <p>${description || "View work"}</p>
        `;

        staffContainer.appendChild(card);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const nameEl = document.getElementById("staff-name");
    const descEl = document.querySelector(".staff-description");
    const mediaEl = document.getElementById("staff-media");
    const backBtn = document.getElementById("staff-back");

    if (!nameEl || !descEl || !mediaEl) return;

    const parts = window.location.pathname.split("/").filter(Boolean);

    const personName = decodeURIComponent(parts[parts.length - 2]);
    const displayName = personName.replace(/-/g, " ");

    nameEl.textContent = displayName;
    document.title = `${displayName} | Elysian: To Be Seen`;

    // SHOW BACK BUTTON
    if (backBtn) {
        backBtn.style.display = "block";
        backBtn.addEventListener("click", () => {
            history.back();
        });
    }

    mediaEl.innerHTML = "";
    descEl.textContent = "";

    const files = await cachedFetch(
        `https://api.github.com/repos/${USER}/${REPO}/contents/staffs-work/${personName}`
    );

    if (!Array.isArray(files)) return;

    // DESCRIPTION
    const descFile = files.find(f => f.name === "description.txt");

    if (descFile) {
        descEl.textContent = await cachedFetch(descFile.download_url);
    }

    // MEDIA
    const mediaFiles = files.filter(f =>
        /\.(png|jpg|jpeg|webp|gif|mp4|webm|mov|mp3|wav|ogg|flac|m4a)$/i.test(f.name)
    );

    for (const file of mediaFiles) {
        const url = file.download_url;

        if (/\.(png|jpg|jpeg|webp|gif)$/i.test(file.name)) {
            const img = document.createElement("img");
            img.src = url;
            mediaEl.appendChild(img);
        }

        else if (/\.(mp4|webm|mov)$/i.test(file.name)) {
            const vid = document.createElement("video");
            vid.controls = true;
            vid.src = url;
            mediaEl.appendChild(vid);
        }

        else if (/\.(mp3|wav|ogg|flac|m4a)$/i.test(file.name)) {
            const aud = document.createElement("audio");
            aud.controls = true;
            aud.src = url;
            mediaEl.appendChild(aud);
        }
    }

    const articlesHTML = await buildArticlesHTML(files);
    if (articlesHTML) {
        mediaEl.insertAdjacentHTML("afterend", articlesHTML);
    }
});

// CREATIVE PERSON OF THE WEEK

async function loadCPOTW() {

    const nameElement = document.getElementById("cpotw-name");
    const descriptionElement = document.getElementById("cpotw-description");
    const mediaContainer = document.getElementById("cpotw-media");
    const backBtn = document.getElementById("staff-back");

    if (!nameElement || !descriptionElement || !mediaContainer) return;

    if (backBtn) {
        backBtn.style.display = "block";
        backBtn.addEventListener("click", () => { history.back(); });
    }

    const folder = "creative-person-of-the-week";

    try {

        const files = await cachedFetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/${folder}`
        );

        // Load name.txt first
        const nameFile = files.find(file => file.name === "name.txt");
        if (nameFile) {
            const nameText = await cachedFetch(nameFile.download_url);
            nameElement.textContent = nameText;
            document.title = `${nameElement.textContent.trim()} | Elysian: To Be Seen`;
        }

        // Load description.txt second
        const descriptionFile = files.find(file => file.name === "description.txt");
        if (descriptionFile) {
            descriptionElement.textContent = await cachedFetch(descriptionFile.download_url);
        }

        // Load media files after
        const mediaFiles = files.filter(file =>
            file.name.match(/\.(png|jpg|jpeg|webp|gif|mp4|webm|mov|mp3|wav|ogg|flac|m4a)$/i)
        );

        const imageFiles = mediaFiles.filter(f => f.name.match(/\.(png|jpg|jpeg|webp|gif)$/i));
        const preloadPromises = imageFiles.map(f => {
            return new Promise(resolve => {
                const preload = new Image();
                preload.onload = resolve;
                preload.onerror = resolve;
                preload.src = f.download_url;
            });
        });
        await Promise.all(preloadPromises);

        for (const file of mediaFiles) {

            const extension = file.name.split(".").pop().toLowerCase();

            if (["png", "jpg", "jpeg", "webp", "gif"].includes(extension)) {

                const img = document.createElement("img");
                img.src = file.download_url;
                img.loading = "eager";
                mediaContainer.appendChild(img);

            } else if (["mp4", "webm", "mov"].includes(extension)) {

                const video = document.createElement("video");
                video.src = file.download_url;
                video.controls = true;
                mediaContainer.appendChild(video);

            } else if (["mp3", "wav", "ogg", "flac", "m4a"].includes(extension)) {

                const audio = document.createElement("audio");
                audio.src = file.download_url;
                audio.controls = true;
                mediaContainer.appendChild(audio);
            }
        }

        const articlesHTML = await buildArticlesHTML(files, ["description.txt", "name.txt"]);
        if (articlesHTML) {
            mediaContainer.insertAdjacentHTML("afterend", articlesHTML);
        }
    }
    catch (error) {
        console.error(error);
    }
}

loadCPOTW();