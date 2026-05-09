const USER = "xavier-db";
const REPO = "my-site";
const siteName = "Xavier: Sample Site";

// Site name replacement and repo replacement

document.addEventListener("DOMContentLoaded", () => {

    // update all site name places
    document.querySelectorAll(".siteName").forEach(el => {
        if (el.textContent.includes("Site Name")) {
            el.textContent = el.textContent.replace("Site Name", siteName);
        }
    });

    // update browser tab title if needed
    if (document.title.includes("Site Name")) {
        document.title = document.title.replace("Site Name", siteName);
    }

    document.querySelectorAll(".siteRepo").forEach(el => {
        if (el.href.includes("siteRepo")) {
            el.href = el.href.replace("siteRepo", REPO);
        }
    });
});

// Header hide on scroll

let lastScroll = 0;
const header = document.querySelector("header");

window.addEventListener("scroll", () => {

    if (!header) return;

    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll) {
        header.classList.add("hide");
    } else {
        header.classList.remove("hide");
    }

    lastScroll = currentScroll;
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

        // find info.txt
        const infoFile = files.find(file =>
            file.name === "info.txt"
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

loadMagazines();

// Load individual magazine page

async function loadMagazinePage() {

    const magazineNameElement = document.getElementById("magazine-name");
    const descriptionElement = document.querySelector(".description");
    const heroElement = document.querySelector(".hero");

    if (!magazineNameElement || !descriptionElement) return;

    const parts = window.location.pathname.split("/").filter(Boolean);
    const folderName = decodeURIComponent(parts[parts.length - 1]);
    const displayName = folderName.replace(/-/g, " ");

    magazineNameElement.textContent = displayName;

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
            `https://raw.githubusercontent.com/${USER}/${REPO}/main/magazines/${folderName}/info.txt`
        );

        const description = await infoResponse.text();
        descriptionElement.textContent = description;

    } catch {
        descriptionElement.textContent = "No description available.";
    }
}

loadMagazinePage();