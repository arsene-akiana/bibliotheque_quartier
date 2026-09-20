function setActiveNav() {
    const page = document.body.dataset.page;
    document.querySelectorAll('nav a').forEach((link) => {
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', setActiveNav);
