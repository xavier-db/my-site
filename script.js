const USER = "xavier-db";
const REPO = "my-site";
const siteName = "Xavier: Sample Site";
const contactEmail = "xfakter7@gmail.com";

// Site name replacement and repo replacement
document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".siteName").forEach(el => {
        if (el.textContent.includes("Site Name")) {
            el.textContent = el.textContent.replace("Site Name", siteName);
        }
    });

    document.querySelectorAll(".siteRepo").forEach(el => {
        if (el.href.includes("siteRepo")) {
            el.href = el.href.replace("siteRepo", REPO);
        }
    });
});

const magazinesContainer = document.getElementById("magazines");

// =========================
// MAGAZINES
// =========================
async function loadMagazines() {

    const response = await fetch(
        `https://api.github.com/repos/${USER}/${REPO}/contents/magazines`
    );

    const folders = await response.json();

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

// =========================
// MAGAZINE PAGE
// =========================
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
    document.title = `${displayName} | ${siteName}`;

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

// =========================
// CATEGORY SYSTEM
// =========================
const categoriesContainer = document.getElementById("categories");
const piecesContainer = document.getElementById("pieces");
const categoryTitle = document.getElementById("category-title");

function showCategories() {
    categoriesContainer.style.display = "grid";
    const categoryView = document.getElementById("category-view");
    if (categoryView) categoryView.style.display = "none";
}

document.getElementById("back-button")?.addEventListener("click", showCategories);

const categoryView = document.getElementById("category-view");
if (categoryView) categoryView.style.display = "none";

// =========================
// LOAD CATEGORIES
// =========================
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

        // GET category description (e.g. Art/description.txt)
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

            document.getElementById("category-view").style.display = "block";
            categoriesContainer.style.display = "none";

            loadCategory(folderName, item.name);
        });

        categoriesContainer.appendChild(card);
    }
}

if (categoriesContainer) loadCategories();

// =========================
// LOAD CATEGORY
// =========================
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
                f.name.match(/\.(png|jpg|jpeg|webp|gif|mp4|webm|mov)$/i)
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

// Header scroll
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
    // smooth interpolation (removes jitter)
    current += (target - current) * 0.15;

    header.style.transform = `translateY(${current}px)`;

    requestAnimationFrame(animate);
}

animate();