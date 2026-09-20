function toggleMenu() {
    const menu = document.getElementById('navMenu');
    if (menu) {
        menu.classList.toggle('active');
    }
}

document.addEventListener('click', function(event) {
    const menu = document.getElementById('navMenu');
    const toggle = document.querySelector('.menu-toggle');

    if (!menu || !toggle) return;

    if (!toggle.contains(event.target) && !menu.contains(event.target)) {
        menu.classList.remove('active');
    }
});

document.querySelectorAll('#navMenu a').forEach(link => {
    link.addEventListener('click', function() {
        const menu = document.getElementById('navMenu');
        if (menu) {
            menu.classList.remove('active');
        }
    });
});
