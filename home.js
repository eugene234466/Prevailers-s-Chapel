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

// Dynamic Home Page Events Integration
async function loadHomeEvents() {
    const container = document.getElementById('homeEventsContainer');
    if (!container) return;

    try {
        let events = [];
        try {
            const res = await fetch('/api/events');
            if (res.ok) {
                events = await res.json();
                localStorage.setItem('pci_events_cache', JSON.stringify(events));
            } else {
                throw new Error('Server returned ' + res.status);
            }
        } catch (_) {
            const cached = localStorage.getItem('pci_events_cache');
            if (cached) {
                try {
                    events = JSON.parse(cached);
                } catch (e) {
                    events = [];
                }
            }
        }

        renderHomeEvents(Array.isArray(events) ? events : []);
    } catch (err) {
        console.error('Error loading events on home page:', err);
    }
}

function renderHomeEvents(events) {
    const container = document.getElementById('homeEventsContainer');
    if (!container) return;

    const heroBtn = document.getElementById('heroEventsBtn');
    if (heroBtn && events && events.length > 0) {
        heroBtn.textContent = `Upcoming Events (${events.length})`;
    }

    if (!events || events.length === 0) {
        container.innerHTML = `
            <div class="notice-card">
                <h3>No Upcoming Events</h3>
                <p>There are currently no special events scheduled. Please check back soon or join us for our regular weekly services!</p>
                <div style="display: flex; gap: 12px; justify-content: center; flex-wrap: wrap;">
                    <a href="events.html" class="btn" style="background: var(--church-navy); color: #fff;">➕ Schedule An Event</a>
                    <a href="services.html" class="btn" style="background: transparent; color: var(--church-navy); border: 2px solid var(--church-navy);">View Service Times</a>
                </div>
            </div>
        `;
        return;
    }

    // Display upcoming events on the home page (up to 3)
    const displayEvents = events.slice(0, 3);

    let html = '<div class="event-grid">';
    displayEvents.forEach(evt => {
        const banner = evt.bannerImage || '4.jpeg';
        const category = evt.category || 'Special Service';
        const dateFormatted = formatHomeDate(evt.date);
        const excerpt = evt.description && evt.description.length > 130 
            ? evt.description.substring(0, 130) + '...' 
            : (evt.description || 'Join us for this inspiring program at Prevailers Chapel International.');

        html += `
            <div class="event-card">
                <div class="event-image">
                    <img src="${escapeHtml(banner)}" alt="${escapeHtml(evt.title)}" onerror="this.src='4.jpeg'">
                    <span class="event-badge-category">${escapeHtml(category)}</span>
                    <span class="event-date-pill">${escapeHtml(dateFormatted)}</span>
                </div>
                <div class="event-content">
                    <div class="event">Upcoming Program</div>
                    <h3>${escapeHtml(evt.title)}</h3>
                    <div class="event-meta-info">
                        <span>⏰ ${escapeHtml(evt.time)}</span>
                        <span>📍 ${escapeHtml(evt.location)}</span>
                    </div>
                    <p>${escapeHtml(excerpt)}</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem;">
                        <a href="events.html#card-${evt.id}" class="event-link">Details & Calendar &rarr;</a>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';

    html += `
        <div class="events-cta-row">
            <a href="events.html" class="btn" style="background: var(--church-navy); color: #ffffff; padding: 0.85rem 2.2rem; border-radius: 50px; font-weight: 700; text-decoration: none; border: 2px solid var(--church-navy);">
                View All Events & Schedule New &rarr;
            </a>
        </div>
    `;

    container.innerHTML = html;
}

function formatHomeDate(dateStr) {
    if (!dateStr) return 'Date TBA';
    try {
        const parts = dateStr.split('-');
        if (parts.length === 3) {
            const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const m = months[parseInt(parts[1], 10) - 1] || '';
            const d = parseInt(parts[2], 10);
            return `📅 ${m} ${d}, ${parts[0]}`;
        }
    } catch (_) {}
    return `📅 ${dateStr}`;
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// Automatically load on page initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHomeEvents);
} else {
    loadHomeEvents();
}

