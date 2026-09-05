const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// 1. Root variables update
css = css.replace(
  /:root\s*\{[\s\S]*?\}/,
  `:root {
    --bg-dark: #0c1830;
    --bg-light-body: #f7f3e9;
    --card-bg: #ffffff;
    --card-bg-solid: #ffffff;
    --primary-neon: #c9a13b;
    --primary-navy: #0c1830;
    --accent-green: #c9a13b;
    --accent-gold: #c9a13b;
    --text-dark: #0c1830;
    --text-light: #0c1830;
    --text-muted: #64748b;
    --text-body: #334155;
    --border-color: #e4dbc5;
    --border-subtle: #e2e8f0;
    --card-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
    --transition-smooth: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    --glass-blur: blur(12px);
    --alert-red: #ff3366;
    --font-body: "DM Sans", "Segoe UI", sans-serif;
    --font-display: "Space Grotesk", "DM Sans", sans-serif;
}`
);

// 2. Base Body and Typography
css = css.replace(
  /body\s*\{\s*background-color:\s*var\(--bg-dark\);\s*color:\s*var\(--text-light\);[^}]*\}/,
  `body { background-color: var(--bg-light-body); color: var(--text-dark); line-height: 1.6; padding-bottom: 0px; transition: background-color 0.3s ease-in-out, color 0.3s ease-in-out; overflow-x: hidden; }`
);

// 3. Headings color
css = css.replace(
  /h1,\s*h2,\s*h3,\s*h4,\s*\.nav-logo,\s*\.section-title[^{]*\{[^}]*\}/,
  `h1, h2, h3, h4, .nav-logo, .section-title, .admin-dash-header h1, .admin-panel-head h2 { font-family: var(--font-display); color: var(--text-dark); }`
);

// 4. Section Title & Page Lead
css = css.replace(
  /\.section-title\s*\{[^}]*\}/,
  `.section-title { text-align: center; font-size: clamp(1.5rem, 4.2vw, 2.2rem); margin: 70px 0 30px; text-transform: uppercase; color: var(--text-dark); }`
);

css = css.replace(
  /\.section-title\s+span\s*\{[^}]*\}/,
  `.section-title span { border-bottom: 3px solid var(--primary-neon); padding-bottom: 5px; color: var(--text-dark); }`
);

// 5. Shared Hero Section (Dark Navy Blue Header Area - KEEP DARK)
css = css.replace(
  /\.adm-hero-section\s*\{[^}]*\}/,
  `.adm-hero-section { background-color: #0c1830 !important; color: #ffffff !important; text-align: center; padding: 60px 20px; }`
);

css = css.replace(
  /\.adm-hero-badge\s*\{[^}]*\}/,
  `.adm-hero-badge { font-size: 0.75rem; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: #c9a13b !important; margin-bottom: 12px; display: block; }`
);

css = css.replace(
  /\.adm-hero-title\s*\{[^}]*\}/,
  `.adm-hero-title { font-family: 'Space Grotesk', sans-serif; font-size: 2.2rem; font-weight: 700; margin: 0 0 12px 0; color: #ffffff !important; transition: color 0.4s ease; }`
);

css = css.replace(
  /\.adm-hero-subtitle\s*\{[^}]*\}/,
  `.adm-hero-subtitle { max-width: 600px; margin: 0 auto 0 auto; color: #94a3b8 !important; font-size: 0.9rem; line-height: 1.5; }`
);

// Append comprehensive clean light-theme component overrides to the end of style.css
const lightThemeOverrides = `
/* ==========================================================================
   Clean Light Theme Layout & Container Card Rules
   Consistent across all pages (Overview, About, Courses, Verify, etc.)
   ========================================================================== */

/* Body & Base Elements */
body {
    background-color: #f7f3e9 !important;
    color: #0c1830 !important;
}

#publicMain {
    background-color: transparent;
    color: #0c1830;
}

.page-lead {
    color: #64748b !important;
    text-align: center;
    max-width: 750px;
    margin: -10px auto 30px;
    font-size: 1.05rem;
    line-height: 1.6;
}

.seo-local-blurb {
    color: #64748b !important;
}

.seo-local-blurb strong,
.footer-seo-copy strong,
.category-seo-note {
    color: #0c1830 !important;
}

/* Hero Headers - Keep Dark Navy Blue */
.adm-hero-section {
    background-color: #0c1830 !important;
    color: #ffffff !important;
    text-align: center;
    padding: 60px 20px;
}

.adm-hero-section h1,
.adm-hero-section .adm-hero-title {
    color: #ffffff !important;
}

.adm-hero-badge {
    color: #c9a13b !important;
}

.adm-hero-subtitle {
    color: #94a3b8 !important;
}

header.site-hero.site-hero--split {
    background-color: #0c1830 !important;
}

.hero-headline {
    color: #ffffff !important;
}

.hero-subtext {
    color: #cbd5e1 !important;
}

/* Interior Grid & Content Panels (Who We Are, Our Scale, Campus Focus, etc.) */
.interior-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 24px;
    max-width: 1100px;
    margin: 0 auto;
    padding: 10px 20px 50px;
}

.interior-panel {
    border: 1px solid #e4dbc5 !important;
    border-radius: 16px !important;
    padding: 28px !important;
    background: #ffffff !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
    transition: transform 0.28s ease, border-color 0.28s ease, box-shadow 0.28s ease !important;
}

.interior-panel:hover {
    transform: translateY(-4px) !important;
    border-color: #c9a13b !important;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08) !important;
}

.interior-panel h3 {
    color: #0c1830 !important;
    margin-bottom: 12px !important;
    font-size: 1.3rem !important;
}

.interior-panel p {
    color: #475569 !important;
    line-height: 1.6 !important;
    font-size: 0.95rem !important;
}

.interior-list {
    margin: 14px 0 0 18px !important;
    color: #475569 !important;
}

.interior-list li {
    margin-bottom: 8px !important;
    line-height: 1.5 !important;
}

/* Story Split ("Rooted in Swat") */
.story-split-text h2 {
    color: #0c1830 !important;
}

.story-split-text p {
    color: #475569 !important;
}

.story-check-list li {
    color: #0c1830 !important;
}

.check-icon {
    background: #0c1830 !important;
    color: #ffffff !important;
}

.story-media-caption {
    background: #ffffff !important;
    border: 1px solid #e4dbc5 !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08) !important;
}

.story-media-caption strong {
    color: #0c1830 !important;
}

.story-media-caption span {
    color: #64748b !important;
}

/* Featured Courses Preview Cards */
.featured-courses-preview {
    max-width: 1100px;
    margin: 0 auto;
    padding: 10px 20px 50px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
}

.featured-course-card {
    position: relative;
    border: 1px solid #e4dbc5 !important;
    border-top: 4px solid #c9a13b !important;
    border-radius: 16px !important;
    padding: 28px 24px 26px !important;
    background: #ffffff !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
    display: flex;
    flex-direction: column;
}

.featured-course-card:hover {
    transform: translateY(-5px) !important;
    border-color: #c9a13b !important;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08) !important;
}

.featured-course-card .fc-num {
    display: block;
    font-family: var(--font-display);
    font-size: 1.5rem;
    font-weight: 800;
    color: #c9a13b !important;
    margin-bottom: 12px;
    opacity: 1 !important;
}

.featured-course-card h3 {
    color: #0c1830 !important;
    margin-bottom: 10px;
    font-size: 1.3rem;
}

.featured-course-card p {
    color: #475569 !important;
    font-size: 0.95rem;
    line-height: 1.55;
    margin-bottom: 20px;
    flex-grow: 1;
}

/* Rules Cards */
.rules-grid {
    max-width: 1100px;
    margin: 0 auto;
    padding: 10px 20px 60px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 24px;
}

.rules-col {
    border: 1px solid #e4dbc5 !important;
    border-radius: 16px !important;
    padding: 28px 24px !important;
    background: #ffffff !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
}

.rules-col-label {
    display: block;
    font-family: var(--font-display);
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: #0c1830 !important;
    padding-bottom: 12px;
    margin-bottom: 16px;
    border-bottom: 2px solid #c9a13b !important;
}

.rules-list li {
    color: #475569 !important;
    font-size: 0.92rem;
    line-height: 1.55;
}

.rules-list li::before {
    content: "—";
    position: absolute;
    left: 0;
    color: #c9a13b !important;
    font-weight: 700;
}

/* Course Category Tiles & Course Cards */
.course-cat-tiles {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 24px;
    max-width: 1100px;
    margin: 0 auto 50px;
    padding: 0 20px;
}

.course-cat-tile {
    background: #ffffff !important;
    border: 1px solid #e4dbc5 !important;
    border-radius: 16px !important;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
}

.course-cat-tile:hover {
    transform: translateY(-6px) !important;
    border-color: #c9a13b !important;
    box-shadow: 0 18px 40px rgba(0, 0, 0, 0.08) !important;
}

.course-cat-banner {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba(201, 161, 59, 0.15), rgba(201, 161, 59, 0.04)) !important;
}

.course-cat-banner .course-cat-icon {
    display: inline-block !important;
    font-size: 2.8rem;
}

.course-cat-body {
    padding: 22px 24px 26px !important;
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1;
}

.course-cat-meta {
    font-size: 0.75rem;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    color: #c9a13b !important;
}

.course-cat-body h3 {
    font-size: 1.25rem;
    color: #0c1830 !important;
    margin: 0;
}

.course-cat-body p {
    font-size: 0.9rem;
    color: #475569 !important;
    line-height: 1.5;
    margin: 0;
    flex: 1;
}

.course-cat-link {
    font-size: 0.88rem;
    font-weight: 700;
    color: #c9a13b !important;
    margin-top: 8px;
}

.course-list li {
    background: #ffffff !important;
    border: 1px solid #e4dbc5 !important;
    border-radius: 16px !important;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05) !important;
}

.course-list li:hover {
    border-color: #c9a13b !important;
    transform: translateY(-6px) !important;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.1) !important;
}

.course-item-left {
    color: #0c1830 !important;
}

.course-list li:hover .course-item-left {
    color: #c9a13b !important;
}

.course-card-body {
    background: #ffffff !important;
}

.course-item-category {
    color: #c9a13b !important;
}

.course-search-pill {
    background: #ffffff !important;
    border: 1px solid #e4dbc5 !important;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.06) !important;
}

.course-search-pill input {
    color: #0c1830 !important;
}

.course-search-count {
    background: rgba(201, 161, 59, 0.12) !important;
    color: #0c1830 !important;
}

/* Subpage Grids & Cards (Leadership, Campus, Faculty, Alumni, Contact, Story) */
.leadership-grid,
.campus-grid,
.facility-grid,
.about-story-grid,
.faculty-page-grid,
.contact-info-grid,
.alumni-directory-grid {
    gap: 24px !important;
}

.leadership-card,
.campus-card,
.facility-card,
.about-block,
.faculty-member-card,
.contact-info-card,
.alumni-card,
.metric-card {
    border: 1px solid #e4dbc5 !important;
    border-radius: 16px !important;
    padding: 28px !important;
    background: #ffffff !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
}

.leadership-card:hover,
.campus-card:hover,
.facility-card:hover,
.about-block:hover,
.faculty-member-card:hover,
.contact-info-card:hover,
.alumni-card:hover,
.metric-card:hover {
    transform: translateY(-4px) !important;
    border-color: #c9a13b !important;
    box-shadow: 0 16px 36px rgba(0, 0, 0, 0.08) !important;
}

.leadership-card h3,
.campus-card h3,
.facility-card h3,
.about-block h3,
.faculty-member-card h3,
.contact-info-card h3,
.alumni-card h3 {
    color: #0c1830 !important;
    font-size: 1.25rem !important;
    margin-bottom: 8px !important;
}

.leadership-card p,
.campus-card p,
.facility-card p,
.about-block p,
.faculty-member-card p,
.contact-info-card p,
.alumni-card p {
    color: #475569 !important;
    line-height: 1.55 !important;
    font-size: 0.95rem !important;
}

.contact-info-card a {
    color: #0c1830 !important;
    font-weight: 600;
}

.contact-info-card a:hover {
    color: #c9a13b !important;
}

.leadership-card .lead-label {
    color: #c9a13b !important;
    font-weight: 700;
}

.campus-card .campus-badge {
    background: rgba(201, 161, 59, 0.1) !important;
    color: #c9a13b !important;
    border: 1px solid rgba(201, 161, 59, 0.3) !important;
}

.campus-card .campus-manager {
    color: #0c1830 !important;
    font-weight: 600;
}

.alumni-card .alumni-meta {
    color: #c9a13b !important;
    font-weight: 600;
}

.alumni-card .alumni-role {
    color: #0c1830 !important;
    font-weight: 600;
}

.alumni-card-photo {
    border: 2px solid #e4dbc5 !important;
    background: rgba(201, 161, 59, 0.08) !important;
    color: #c9a13b !important;
}

.faculty-member-card .teacher-photo {
    border: 2px solid #e4dbc5 !important;
}

/* Verification & Form Cards */
.verify-card,
.form-section,
.inquiry-card {
    background: #ffffff !important;
    border: 1px solid #e4dbc5 !important;
    border-radius: 18px !important;
    padding: 35px !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
}

.verify-subtitle {
    color: #475569 !important;
}

.form-group label,
.verify-fields-grid label {
    color: #334155 !important;
    font-weight: 700 !important;
    font-size: 0.85rem !important;
}

.form-group input,
.form-group select,
.form-group textarea,
.verify-fields-grid input,
.verify-input-group input,
.search-wrapper input,
.callback-group input {
    background-color: #ffffff !important;
    border: 1px solid #cbd5e1 !important;
    color: #0c1830 !important;
    border-radius: 8px !important;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus,
.verify-fields-grid input:focus,
.verify-input-group input:focus,
.search-wrapper input:focus {
    border-color: #c9a13b !important;
    box-shadow: 0 0 0 2px rgba(201, 161, 59, 0.2) !important;
    outline: none !important;
}

.verify-result-card {
    background: #f8fafc !important;
    border: 1px solid #e4dbc5 !important;
}

.verify-cert-id {
    color: #0c1830 !important;
}

.verify-detail-label {
    color: #64748b !important;
}

.verify-detail-value {
    color: #0c1830 !important;
}

/* Admission CTA Band */
.admission-cta-band {
    background: #ffffff !important;
    border: 1px solid #e4dbc5 !important;
    border-radius: 18px !important;
    max-width: 1100px !important;
    margin: 20px auto 50px !important;
    padding: 45px 30px !important;
    text-align: center !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
}

.admission-cta-band h2 {
    color: #0c1830 !important;
    font-size: 2rem !important;
    margin-bottom: 10px !important;
}

.admission-cta-band p {
    color: #475569 !important;
    font-size: 1rem !important;
    max-width: 600px !important;
    margin: 0 auto 25px !important;
}

/* Buttons */
.cta-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #0c1830 !important;
    color: #ffffff !important;
    border: 2px solid #0c1830 !important;
    padding: 12px 28px !important;
    min-height: 44px;
    font-size: 0.95rem;
    font-weight: 700;
    text-transform: uppercase;
    text-decoration: none;
    border-radius: 6px !important;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    cursor: pointer;
    text-align: center;
}

.cta-btn:hover {
    background: #c9a13b !important;
    border-color: #c9a13b !important;
    color: #0c1830 !important;
    box-shadow: 0 6px 20px rgba(201, 161, 59, 0.35) !important;
    transform: translateY(-2px);
}

.cta-btn.secondary {
    background: transparent !important;
    color: #0c1830 !important;
    border: 2px solid #0c1830 !important;
}

.cta-btn.secondary:hover {
    background: #0c1830 !important;
    color: #ffffff !important;
    border-color: #0c1830 !important;
    box-shadow: 0 6px 20px rgba(12, 24, 48, 0.25) !important;
}

.site-hero .cta-btn,
.adm-hero-section .cta-btn {
    background: #c9a13b !important;
    color: #0c1830 !important;
    border-color: #c9a13b !important;
}

.site-hero .cta-btn:hover,
.adm-hero-section .cta-btn:hover {
    background: #ffffff !important;
    border-color: #ffffff !important;
    color: #0c1830 !important;
}

.site-hero .cta-btn.secondary,
.adm-hero-section .cta-btn.secondary {
    background: transparent !important;
    color: #ffffff !important;
    border-color: #ffffff !important;
}

.site-hero .cta-btn.secondary:hover,
.adm-hero-section .cta-btn.secondary:hover {
    background: #ffffff !important;
    color: #0c1830 !important;
}

.submit-btn {
    width: 100%;
    padding: 14px;
    background: #0c1830 !important;
    border: none;
    border-radius: 6px;
    color: #ffffff !important;
    font-size: 1.05rem;
    font-weight: bold;
    cursor: pointer;
    text-transform: uppercase;
    transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.submit-btn:hover {
    background: #c9a13b !important;
    color: #0c1830 !important;
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(201, 161, 59, 0.3);
}

/* Testimonials & FAQ */
.testimonials-wrapper {
    background: #ffffff !important;
    border: 1px solid #e4dbc5 !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05) !important;
}

.testimonial-text {
    color: #0c1830 !important;
}

.testimonial-user {
    color: #c9a13b !important;
}

.testimonial-course {
    color: #64748b !important;
}

.faq-item {
    background: #ffffff !important;
    border: 1px solid #e4dbc5 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03) !important;
}

.faq-question {
    color: #0c1830 !important;
}

.faq-answer {
    color: #475569 !important;
}

/* Footer */
footer {
    max-width: 1200px;
    margin: 40px auto 30px;
    padding: 35px 24px 30px;
    text-align: center;
    background-color: #ffffff !important;
    border-radius: 18px !important;
    border: 1px solid #e4dbc5 !important;
    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important;
    font-size: 0.95rem;
    color: #475569 !important;
}

footer span {
    color: #c9a13b !important;
    font-weight: bold;
}

.footer-contact {
    border-bottom: 1px solid #e4dbc5 !important;
}

.footer-contact-link {
    background: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    color: #0c1830 !important;
}

.footer-contact-link:hover {
    background: #c9a13b !important;
    border-color: #c9a13b !important;
    color: #ffffff !important;
}

.footer-campus-label {
    color: #0c1830 !important;
    font-weight: 700 !important;
}

.footer-campus-address {
    color: #64748b !important;
}

.footer-seo-copy {
    color: #64748b !important;
}

/* Mobile Nav Drawer */
@media (max-width: 768px) {
    .nav-links {
        background: #ffffff !important;
        border: 1px solid #e4dbc5 !important;
        box-shadow: 0 22px 48px rgba(0, 0, 0, 0.15) !important;
    }

    .nav-links > li > a,
    .nav-dropdown-toggle {
        color: #0c1830 !important;
    }

    .nav-links > li > a:hover,
    .nav-dropdown-toggle:hover {
        background: #f8fafc !important;
        color: #c9a13b !important;
    }

    .nav-dropdown-menu {
        background: #f8fafc !important;
    }

    .nav-dropdown-menu a {
        color: #0c1830 !important;
    }
}
`;

css += '\n' + lightThemeOverrides;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated css/style.css with light theme styling!');
