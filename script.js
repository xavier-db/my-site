const USER = "xavier-db";
const REPO = "my-site";
const contactEmail = "elysian.magazine.official@gmail.com";

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

// MAGAZINES

async function loadMagazines() {

    const response = await fetch(
        `https://api.github.com/repos/${USER}/${REPO}/contents/magazines`
    );

    const folders = await response.json();
    if (!Array.isArray(folders)) return;

    for (const folder of folders) {

        if (folder.type !== "dir") continue;
        if (folder.name === "magazine-reference (DO NOT DELETE)") continue;

        const folderResponse = await fetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${folder.name}`
        );

        const files = await folderResponse.json();

        const infoFile = files.find(f => f.name === "description.txt");

        let description = "";

        if (infoFile) {
            const infoResponse = await fetch(infoFile.download_url);
            description = await infoResponse.text();
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
        const folderResponse = await fetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${folderName}`
        );

        const files = await folderResponse.json();

        const imageFile = files.find(f =>
            f.name.match(/\.(png|jpg|jpeg|webp|gif)$/i)
        );

        if (imageFile) {
            heroElement.style.backgroundImage = `url(${imageFile.download_url})`;
        }

        const infoResponse = await fetch(
            `https://raw.githubusercontent.com/${USER}/${REPO}/main/magazines/${folderName}/description.txt`
        );

        descriptionElement.textContent = await infoResponse.text();

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

    const response = await fetch(
        `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${folderName}`
    );

    const items = await response.json();
    if (!Array.isArray(items)) return;

    for (const item of items) {

        if (item.type !== "dir") continue;

        const categoryContents = await fetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${folderName}/${item.name}`
        );

        const categoryFiles = await categoryContents.json();

        const descFile = categoryFiles.find(f => f.name === "description.txt");

        let description = "";

        if (descFile) {
            const res = await fetch(descFile.download_url);
            description = await res.text();
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

        const response = await fetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${magazineName}/${categoryName}`
        );

        const items = await response.json();
        if (!Array.isArray(items)) return;

        for (const item of items) {

            if (item.type !== "dir") continue;

            const pieceResponse = await fetch(
                `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${magazineName}/${categoryName}/${item.name}`
            );

            const files = await pieceResponse.json();

            const descriptionFile = files.find(f => f.name === "description.txt");

            let description = "";

            if (descriptionFile) {
                const res = await fetch(descriptionFile.download_url);
                description = await res.text();
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
    const res = await fetch(
        `https://api.github.com/repos/${USER}/${REPO}/contents/staffs-work`
    );

    const folders = await res.json();
    if (!Array.isArray(folders)) return;

    // CUSTOM ORDER (ADD FOLDER NAMES FOR CUSTOM ORDER)
    const customOrder = [
        "J.S.Lynn",
        "Yazia Inara"
    ];

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
            const descRes = await fetch(
                `https://raw.githubusercontent.com/${USER}/${REPO}/main/staffs-work/${folder.name}/description.txt`
            );
            if (descRes.ok) description = await descRes.text();
        } catch {}

        let coverUrl = null;

        try {
            const folderRes = await fetch(
                `https://api.github.com/repos/${USER}/${REPO}/contents/staffs-work/${folder.name}`
            );
            const files = await folderRes.json();
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

    const res = await fetch(
        `https://api.github.com/repos/${USER}/${REPO}/contents/staffs-work/${personName}`
    );

    const files = await res.json();
    if (!Array.isArray(files)) return;

    // DESCRIPTION
    const descFile = files.find(f => f.name === "description.txt");

    if (descFile) {
        const text = await fetch(descFile.download_url).then(r => r.text());
        descEl.textContent = text;
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

        const response = await fetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/${folder}`
        );

        const files = await response.json();

        // Load name.txt first
        const nameFile = files.find(file => file.name === "name.txt");
        if (nameFile) {
            const res = await fetch(nameFile.download_url);
            nameElement.textContent = await res.text();
            document.title = `${nameElement.textContent.trim()} | Elysian: To Be Seen`;
        }

        // Load description.txt second
        const descriptionFile = files.find(file => file.name === "description.txt");
        if (descriptionFile) {
            const res = await fetch(descriptionFile.download_url);
            descriptionElement.textContent = await res.text();
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

    } catch (error) {
        console.error(error);
    }
}

loadCPOTW();