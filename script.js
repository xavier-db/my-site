const USER = "xavier-db";
const REPO = "my-site";
const siteName = "Xavier: Sample Site";
const contactEmail = "xfakter7@gmail.com"

// Site name replacement and repo replacement

document.addEventListener("DOMContentLoaded", () => {

    // update all site name places
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

// Load magazines

const magazinesContainer = document.getElementById("magazines");

async function loadMagazines() {

    const response = await fetch(
        `https://api.github.com/repos/${USER}/${REPO}/contents/magazines`
    );

    const folders = await response.json();

    for (const folder of folders) {

        // only folders
        if (folder.type !== "dir") continue;

        // skip template folder
        if (folder.name === "magazine-reference (DO NOT DELETE)") continue;

        // get files inside magazine folder
        const folderResponse = await fetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${folder.name}`
        );

        const files = await folderResponse.json();

        // find description.txt
        const infoFile = files.find(file =>
            file.name === "description.txt"
        );

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

if (magazinesContainer) {
    loadMagazines();
}

// Load individual magazine page

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

    const fullTitle = `${displayName} | ${siteName}`;

    magazineNameElement.textContent = displayName;

    document.title = fullTitle;

    try {

        const folderResponse = await fetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${folderName}`
        );

        const files = await folderResponse.json();

        // FIND FIRST IMAGE
        const imageFile = files.find(file =>
            file.name.match(/\.(png|jpg|jpeg|webp|gif)$/i)
        );

        if (imageFile) {
            heroElement.style.backgroundImage = `url(${imageFile.download_url})`;
        }

        // LOAD INFO
        const infoResponse = await fetch(
            `https://raw.githubusercontent.com/${USER}/${REPO}/main/magazines/${folderName}/description.txt`
        );

        const description = await infoResponse.text();
        descriptionElement.textContent = description;

    } catch {
        descriptionElement.textContent = "No description available.";
    }
}

loadMagazinePage();

// Header scroll

const header = document.querySelector("header");

if (header) {

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
}

// =========================
// CATEGORY SYSTEM
// =========================

const categoriesContainer = document.getElementById("categories");
const piecesContainer = document.getElementById("pieces");
const categoryTitle = document.getElementById("category-title");

function showCategories() {
    categoriesContainer.style.display = "grid";
    document.getElementById("category-view").style.display = "none";
}

document.getElementById("back-button")?.addEventListener("click", showCategories);
document.getElementById("category-view").style.display = "none";

async function loadCategories() {

    const parts = window.location.pathname.split("/").filter(Boolean);
    const magazineIndex = parts.indexOf("magazines");
    const folderName = decodeURIComponent(parts[magazineIndex + 1]);

    const response = await fetch(
        `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${folderName}`
    );

    const folders = await response.json();
    if (!Array.isArray(folders)) return;

    for (const folder of folders) {

        if (folder.type !== "dir") continue;

        const card = document.createElement("a");
        card.className = "magazine-card";
        card.href = "#";

        card.innerHTML = `
            <div class="card-cover">
                <h2>${folder.name}</h2>
            </div>
        `;

        card.addEventListener("click", (e) => {
            e.preventDefault();

            categoriesContainer.style.display = "none";
            document.getElementById("category-view").style.display = "block";

            loadCategory(folderName, folder.name);
        });

        categoriesContainer.appendChild(card);
    }
}

async function loadCategory(magazineName, categoryName) {

    if (!piecesContainer || !categoryTitle) return;

    piecesContainer.innerHTML = "";

    categoryTitle.textContent = categoryName;

    try {

        const response = await fetch(
            `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${magazineName}/${categoryName}`
        );

        const folders = await response.json();

        if (!Array.isArray(folders)) return;
        
        for (const piece of folders) {

            if (piece.type !== "dir") continue;

            const pieceResponse = await fetch(
                `https://api.github.com/repos/${USER}/${REPO}/contents/magazines/${magazineName}/${categoryName}/${piece.name}`
            );

            const files = await pieceResponse.json();

            // description
            const descriptionFile = files.find(file =>
                file.name === "description.txt"
            );

            let description = "";

            if (descriptionFile) {

                const descResponse = await fetch(descriptionFile.download_url);

                description = await descResponse.text();
            }

            // first image
            const imageFile = files.find(file =>
                file.name.match(/\.(png|jpg|jpeg|webp|gif)$/i)
            );

            // video
            const videoFile = files.find(file =>
                file.name.match(/\.(mp4|webm|mov)$/i)
            );

            const card = document.createElement("div");

            card.className = "piece-card";

            let mediaHTML = "";

            if (imageFile) {

                mediaHTML += `
                    <img src="${imageFile.download_url}" alt="${piece.name}">
                `;
            }

            if (videoFile) {

                mediaHTML += `
                    <video controls>
                        <source src="${videoFile.download_url}">
                    </video>
                `;
            }

            card.innerHTML = `
                ${mediaHTML}
                <h3>${piece.name}</h3>
                <p>${description}</p>
            `;

            piecesContainer.appendChild(card);
        }

    } catch (error) {
        console.error("Failed loading category", error);
    }
}

if (categoriesContainer) {
    loadCategories();
}