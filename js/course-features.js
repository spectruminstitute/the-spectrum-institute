// Extra course-page features: fee/duration/level/rating badges on cards,
// wishlist, level filter + sort, and a 2-course comparison tool.
// Depends on COURSE_CATALOG_DATA (js/course-catalog-data.js) and helpers
// already defined in js/app.js (escapeHtml, slugifyCourseName).

let compareSelection = [];
let wishlistOnlyActive = false;

function parseFeeNumber(feeStr) {
    if (!feeStr) return 0;
    const match = feeStr.replace(/,/g, '').match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
}

function getWhatsAppNumberForCategory(category) {
    const numbers = { safety: '923309151621', computer: '923464792048' };
    return numbers[category] || '923469709296';
}

function getWishlist() {
    try {
        return JSON.parse(localStorage.getItem('tsi_wishlist') || '[]');
    } catch (e) {
        return [];
    }
}

function isWishlisted(name) {
    return getWishlist().indexOf(name) > -1;
}

function toggleWishlist(name, btnEl) {
    let list = getWishlist();
    if (list.indexOf(name) > -1) {
        list = list.filter(n => n !== name);
        if (btnEl) { btnEl.classList.remove('active'); btnEl.innerHTML = '♡'; }
    } else {
        list.push(name);
        if (btnEl) { btnEl.classList.add('active'); btnEl.innerHTML = '♥'; }
    }
    localStorage.setItem('tsi_wishlist', JSON.stringify(list));
    updateWishlistCount();
    if (wishlistOnlyActive) applyCourseToolbar();
}

function updateWishlistCount() {
    const el = document.getElementById('wishlistCount');
    if (el) el.textContent = getWishlist().length;
}

function toggleWishlistOnlyView() {
    wishlistOnlyActive = !wishlistOnlyActive;
    const btn = document.getElementById('courseWishlistToggle');
    if (btn) btn.classList.toggle('active', wishlistOnlyActive);
    applyCourseToolbar();
}

function applyCourseToolbar() {
    const levelVal = document.getElementById('courseLevelFilter')?.value || '';
    const sortVal = document.getElementById('courseSortSelect')?.value || 'default';

    document.querySelectorAll('#coursesGrid .category-card').forEach(card => {
        if (card.style.display === 'none') return;
        const list = card.querySelector('.course-list');
        if (!list) return;
        const items = Array.from(list.children);

        items.forEach(li => {
            let show = true;
            if (levelVal && li.dataset.level !== levelVal) show = false;
            if (wishlistOnlyActive && !isWishlisted(li.dataset.courseName)) show = false;
            li.classList.toggle('toolbar-hide', !show);
        });

        if (sortVal !== 'default') {
            items.sort((a, b) => {
                if (sortVal === 'fee-asc') return (parseFloat(a.dataset.fee) || 0) - (parseFloat(b.dataset.fee) || 0);
                if (sortVal === 'fee-desc') return (parseFloat(b.dataset.fee) || 0) - (parseFloat(a.dataset.fee) || 0);
                if (sortVal === 'rating-desc') return (parseFloat(b.dataset.rating) || 0) - (parseFloat(a.dataset.rating) || 0);
                if (sortVal === 'duration-asc') return (parseFloat(a.dataset.durationDays) || 0) - (parseFloat(b.dataset.durationDays) || 0);
                return 0;
            });
            items.forEach(li => list.appendChild(li));
        }
    });
}

function toggleCompareSelection(name, checkboxEl) {
    if (checkboxEl.checked) {
        if (compareSelection.length >= 2) {
            checkboxEl.checked = false;
            alert('You can compare up to 2 courses at a time.');
            return;
        }
        compareSelection.push(name);
    } else {
        compareSelection = compareSelection.filter(n => n !== name);
    }
    updateCompareTray();
}

function updateCompareTray() {
    const tray = document.getElementById('compareTray');
    const text = document.getElementById('compareTrayText');
    const btn = document.getElementById('compareTrayBtn');
    if (!tray) return;
    tray.classList.toggle('active', compareSelection.length > 0);
    if (text) {
        text.textContent = compareSelection.length === 0
            ? 'Select up to 2 courses to compare'
            : compareSelection.join('  vs  ');
    }
    if (btn) btn.disabled = compareSelection.length !== 2;
}

function clearCompareSelection() {
    compareSelection = [];
    document.querySelectorAll('.course-compare-check input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    updateCompareTray();
}

function openCompareModal() {
    if (compareSelection.length !== 2) return;
    const grid = document.getElementById('compareGrid');
    if (!grid) return;
    grid.innerHTML = compareSelection.map(name => {
        const data = (typeof COURSE_CATALOG_DATA !== 'undefined' && COURSE_CATALOG_DATA[name]) ? COURSE_CATALOG_DATA[name] : {};
        const extra = (typeof courseDatabase !== 'undefined' && courseDatabase[name]) ? courseDatabase[name] : {};
        const slug = (typeof slugifyCourseName === 'function') ? slugifyCourseName(name) : '';
        return `
            <div class="compare-col">
                <div class="compare-col-photo"><img src="course-images/${slug}.jpg" alt="${escapeHtml(name)}" onerror="this.style.display='none'"></div>
                <h4>${escapeHtml(name)}</h4>
                <div class="compare-row"><span>Fee</span><strong>${data.fee || '—'}</strong></div>
                <div class="compare-row"><span>Duration</span><strong>${data.duration || '—'}</strong></div>
                <div class="compare-row"><span>Level</span><strong>${data.level || '—'}</strong></div>
                <div class="compare-row"><span>Rating</span><strong>⭐ ${data.rating || '—'} (${data.reviews || 0})</strong></div>
                <div class="compare-row"><span>Instructor</span><strong>${data.instructor ? escapeHtml(data.instructor.name) : '—'}</strong></div>
                <div class="compare-row"><span>Career Paths</span><strong>${escapeHtml(extra.career || '—')}</strong></div>
                <a href="admissions.html?course=${encodeURIComponent(name)}#apply" class="cta-btn compare-enroll-btn">Enroll Now</a>
            </div>
        `;
    }).join('');
    document.getElementById('compareModal')?.classList.add('open');
}

function closeCompareModal(event) {
    if (event.target.id === 'compareModal') forceCloseCompareModal();
}

function forceCloseCompareModal() {
    document.getElementById('compareModal')?.classList.remove('open');
}

function enhanceCourseCards() {
    if (typeof COURSE_CATALOG_DATA === 'undefined') return;

    document.querySelectorAll('.course-list li[onclick]').forEach(li => {
        const match = li.getAttribute('onclick').match(/openSyllabusModal\('([^']+)'/);
        if (!match) return;
        const name = match[1];
        const data = COURSE_CATALOG_DATA[name];
        if (!data) return;

        li.dataset.courseName = name;
        li.dataset.fee = parseFeeNumber(data.fee);
        li.dataset.level = data.level;
        li.dataset.rating = data.rating;
        li.dataset.durationDays = data.durationDays;

        const banner = li.querySelector('.course-card-banner');
        const body = li.querySelector('.course-card-body');
        if (!banner || !body) return;

        const catMeta = (typeof COURSE_CATEGORY_META !== 'undefined' && COURSE_CATEGORY_META[data.category]) || null;
        const linkEl = body.querySelector('.course-card-link');
        if (catMeta && linkEl && !body.querySelector('.course-item-meta-row')) {
            const metaRow = document.createElement('div');
            metaRow.className = 'course-item-meta-row';
            const catLabel = document.createElement('span');
            catLabel.className = 'course-item-category';
            catLabel.textContent = catMeta.label.replace(/ Courses$| Classes$/, '').toUpperCase();
            metaRow.appendChild(catLabel);
            metaRow.appendChild(linkEl);
            body.appendChild(metaRow);
        }
    });

    updateWishlistCount();
}

document.addEventListener('DOMContentLoaded', enhanceCourseCards);
