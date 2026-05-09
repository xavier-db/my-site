const USER = "xavier-db";
const REPO = "my-site";

// Load header and footer

fetch('./modules/header.html')
.then(response => response.text())
.then(data => {
    document.getElementById('header').innerHTML = data;

    const currentPage = window.location.pathname.split('/').pop();

    if (currentPage === "index.html" || currentPage === "") {
        document.querySelector(".index-link")?.classList.add("active");
    }
    else if (currentPage === "about.html") {
        document.querySelector(".about-link")?.classList.add("active");
    }

    else if (currentPage === "staff.html") {
        document.querySelector(".staff-link")?.classList.add("active");
    }

    else if (currentPage === "contact.html") {
        document.querySelector(".contact-link")?.classList.add("active");
    }
});

fetch('./modules/footer.html')
.then(response => response.text())
.then(data => {
    document.getElementById('footer').innerHTML = data;
});


// Header hide on scroll

let lastScroll = 0;
const header = document.getElementById("header");

window.addEventListener("scroll", () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > lastScroll) {
        // scrolling down
        header.classList.add("hide");
    } else {
        // scrolling up
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

        // find first image
        const imageFile = files.find(file =>
            file.name.match(/\.(png|jpg|jpeg|webp|gif)$/i)
        );

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
    const titleElement = document.querySelector("title");

    // stop if not on a magazine page
    if (!magazineNameElement || !descriptionElement) return;

    // get folder name from URL
    const pathParts = window.location.pathname.split("/");

    // example:
    // /my-site/magazines/issue-1/
    // -> issue-1
    const parts = window.location.pathname.split("/").filter(Boolean);

    // assumes last folder is magazine name
    const folderName = decodeURIComponent(parts[parts.length - 1]);

    // prettier display name
    const displayName = folderName.replace(/-/g, " ");

    magazineNameElement.textContent = displayName;

    try {

        // load info.txt
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