// Load header and footer

fetch('/modules/header.html')
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

fetch('/modules/footer.html')
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