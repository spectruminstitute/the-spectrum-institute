/**
 * One-shot generator for TSI multi-page HTML portal.
 * Run: node tools/generate-pages.js
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const original = fs.readFileSync(path.join(root, "index.html"), "utf8");

function extract(startMarker, endMarker) {
  const start = original.indexOf(startMarker);
  const end = original.indexOf(endMarker, start);
  if (start < 0 || end < 0) {
    throw new Error(`Could not extract between markers:\n${startMarker}\n${endMarker}`);
  }
  return original.slice(start, end);
}

function head(title, description, extra = "", pagePath = "") {
  const canonical = pagePath === "index.html" || pagePath === ""
    ? "https://spectruminstitute.uk/"
    : `https://spectruminstitute.uk/${pagePath}`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="author" content="The Spectrum Institute">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <meta name="geo.region" content="PK-KP">
    <meta name="geo.placename" content="Barikot &amp; Mingora, Swat">
    <link rel="icon" type="image/png" sizes="32x32" href="logo.png">
    <link rel="icon" type="image/png" sizes="192x192" href="logo.png">
    <link rel="apple-touch-icon" sizes="180x180" href="logo.png">
    <link rel="shortcut icon" href="logo.png">
    <link rel="canonical" href="${canonical}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="The Spectrum Institute">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${canonical}">
    <meta property="og:image" content="https://spectruminstitute.uk/logo.png">
    <meta property="og:image:alt" content="The Spectrum Institute logo">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="https://spectruminstitute.uk/logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
${extra}</head>
<body>
`;
}

function nav(active) {
  const links = [
    ["index.html", "Home"],
    ["about.html", "About"],
    ["courses.html", "Courses"],
    ["faculty.html", "Faculty"],
    ["verify.html", "Verify"],
    ["contact.html", "Contact"],
  ];
  return `    <div class="toast-container" id="toastContainer"></div>

    <div class="promo-bar">⚡ Admissions are Open for New Batches! Apply Now ⚡</div>

    <nav class="main-navbar" aria-label="Primary">
        <div class="nav-container">
            <a href="index.html" class="nav-logo" id="nav-logo" title="The Spectrum Institute">TSI <span>Spectrum</span></a>
            <div class="nav-controls">
                <button type="button" class="nav-toggle-btn" id="navToggleBtn" aria-label="Open menu" aria-expanded="false" aria-controls="publicNavLinks">
                    <span></span><span></span><span></span>
                </button>
                <ul class="nav-links" id="publicNavLinks">
${links
  .map(
    ([href, label]) =>
      `                    <li><a href="${href}"${label === active ? ' class="is-active"' : ""}>${label}</a></li>`
  )
  .join("\n")}
                </ul>
                <button type="button" class="nav-mode-btn" id="themeToggleBtn" onclick="toggleLightMode()" aria-label="Switch to light mode" aria-pressed="false" title="Toggle light / dark mode">
                    <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
                        <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 2.8v2.2M12 19v2.2M21.2 12h-2.2M5 12H2.8M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6M18.5 18.5l-1.6-1.6M7.1 7.1 5.5 5.5"/>
                    </svg>
                    <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M20.2 13.4A7.8 7.8 0 0 1 10.6 3.8 8.2 8.2 0 1 0 20.2 13.4z"/>
                    </svg>
                </button>
            </div>
        </div>
    </nav>
`;
}

const chat = `    <div class="notice-board">
        <div class="notice-text">Special scholarships are available for ICT, Cyber Security, AI Engineering, basic computer skills, English language and for fsc coaching classes</div>
    </div>

    <div class="chat-heads-container">
        <div class="chat-menu-panel" id="chatMenuPanel">
            <div class="chat-panel-header">
                <h4>Connect with Us</h4>
                <p>Select a department to start chat</p>
            </div>
            <div class="department-list">
                <a href="https://wa.me/923469709296?text=Hi,%20I%20want%20to%20know%20about%20Admissions." target="_blank" class="dept-item">
                    <div class="dept-avatar">🎓</div>
                    <div class="dept-meta">
                        <font>Admission Desk</font>
                        <span>Online | Response instant</span>
                    </div>
                </a>
                <a href="https://wa.me/923309151621?text=Hi,%20I%20have%20a%20query%20about%20Safety%20Courses." target="_blank" class="dept-item">
                    <div class="dept-avatar">🛡️</div>
                    <div class="dept-meta">
                        <font>Safety Department</font>
                        <span>Online | Response within minutes</span>
                    </div>
                </a>
                <a href="https://wa.me/923464792048?text=Hi,%20I%20want%20to%20talk%20to%20the%20IT%20Head." target="_blank" class="dept-item">
                    <div class="dept-avatar">💻</div>
                    <div class="dept-meta">
                        <font>IT Hub Desk</font>
                        <span>Available | Ask technical questions</span>
                    </div>
                </a>
            </div>
        </div>
        <div class="chat-trigger-btn" onclick="toggleChatMenu()">
            <span class="chat-trigger-icon" aria-hidden="true">💬</span>
            <div class="badge-dot"></div>
        </div>
    </div>
`;

const footer = `    <footer role="contentinfo">
        <div class="footer-contact" aria-label="Institute contact details">
            <a class="footer-contact-link" href="tel:+923469709296"><span>0346-9709296</span></a>
            <a class="footer-contact-link" href="tel:+923309151621"><span>0330-9151621</span></a>
            <a class="footer-contact-link" href="tel:+923464792048"><span>0346-4792048</span></a>
            <a class="footer-contact-link footer-contact-email" href="mailto:info@tsi.com"><span>info@tsi.com</span></a>
        </div>
        <div class="footer-campuses" aria-label="Campus addresses">
            <p class="footer-campus-line"><span class="footer-campus-label">Barikot Main Campus:</span> <span class="footer-campus-address">1st Floor, Usman Plaza, Main Pull, Barikot, Swat.</span></p>
            <p class="footer-campus-line"><span class="footer-campus-label">Mingora City Campus:</span> <span class="footer-campus-address">Opposite to Mela Ground, Mingora, Swat (Branch Manager: Amir Hamza)</span></p>
        </div>
        <p>&copy; 2026 <span>The Spectrum Institute (TSI)</span> - Barikot &amp; Mingora, Swat. All technical rights reserved.</p>
        <p class="footer-seo-copy">The Spectrum Institute is the <strong>Best Technical and Professional Education Institute in Barikot &amp; Mingora, Swat</strong>, offering <strong>Safety Engineering diplomas in Swat, Pakistan</strong> and serving as a <strong>Top IT and Software Development training center in Swat</strong>.</p>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
`;

function write(file, content) {
  fs.writeFileSync(path.join(root, file), content, "utf8");
  console.log("wrote", file);
}

// Extract reusable chunks from original SPA
const heroBlock = extract('<header class="site-hero"', "<main id=\"publicMain\">")
  .replace('href="#apply"', 'href="contact.html#apply"')
  .replace('href="#courses-heading"', 'href="courses.html"');

const coursesSection = extract(
  '<div class="search-wrapper">',
  '<section class="timeline-section-wrap"'
);

const timetableSection = extract(
  '<section class="timeline-section-wrap"',
  '<section class="reviews-section-wrap"'
);

const reviewsSection = extract(
  '<section class="reviews-section-wrap"',
  '<section class="faq-section-wrap"'
);

const faqSection = extract(
  '<section class="faq-section-wrap"',
  '<section class="form-section'
);

const applySection = extract(
  '<section class="form-section hide-when-admin" id="apply"',
  '<section class="verify-section-wrap"'
).replace('class="form-section hide-when-admin"', 'class="form-section"');

const verifySection = extract(
  '<section class="verify-section-wrap"',
  '<section class="inquiry-section-wrap"'
);

const inquirySection = extract(
  '<section class="inquiry-section-wrap"',
  '<section class="map-section-wrap"'
);

const mapSection = extract(
  '<section class="map-section-wrap"',
  "</main>"
);

const syllabusModal = extract(
  '<div class="modal-overlay" id="syllabusModal"',
  "<!-- CSV Validation Summary Modal -->"
);

const qrModal = extract(
  '<div class="modal-overlay" id="qrScannerModal"',
  '<div class="modal-overlay" id="syllabusModal"'
);

const adminDashboard = extract(
  '<section id="adminDashboard"',
  '<div class="modal-overlay" id="qrScannerModal"'
);

const csvModal = extract(
  "<!-- CSV Validation Summary Modal -->",
  "<!-- Certificate Preview Modal -->"
);

const certPreviewModal = extract(
  "<!-- Certificate Preview Modal -->",
  "<footer role=\"contentinfo\">"
);

// ---------- index.html ----------
write(
  "index.html",
  head(
    "The Spectrum Institute (TSI) | Technical &amp; Safety Education in Barikot &amp; Mingora, Swat",
    "The Spectrum Institute (TSI Swat) offers professional technical, computer, and safety education in Barikot &amp; Mingora, Swat."
  ) +
    nav("Home") +
    `    <div id="publicSiteShell">
` +
    chat +
    heroBlock +
    `    <main id="publicMain">
    <section class="page-band" aria-labelledby="metrics-heading">
        <div class="section-title" id="metrics-heading"><span>Institute Snapshot</span></div>
        <p class="page-lead">Practical training pathways for safety, IT, coaching, and languages — built for Barikot and the wider Swat region.</p>
    </section>
    <div class="metrics-grid" aria-label="Key metrics">
        <article class="metric-card"><strong>40+</strong><span>Professional Courses</span></article>
        <article class="metric-card"><strong>7</strong><span>Expert Faculty Leads</span></article>
        <article class="metric-card"><strong>3</strong><span>Learning Tracks</span></article>
        <article class="metric-card"><strong>100%</strong><span>Hands-on Focus</span></article>
    </div>

    <section class="page-band" aria-labelledby="featured-heading">
        <div class="section-title" id="featured-heading"><span>Featured Courses</span></div>
        <p class="page-lead">A quick look at our most requested tracks. Explore the full catalog for syllabus details and batch timings.</p>
    </section>
    <div class="featured-courses-preview">
        <article class="featured-course-card">
            <h3>Safety Engineering</h3>
            <p>NEBOSH, IOSH, OSHA, Fire Safety, and internationally recognized HSE credentials.</p>
            <a href="courses.html" class="cta-btn secondary">View Safety Courses</a>
        </article>
        <article class="featured-course-card">
            <h3>IT &amp; AI Hub</h3>
            <p>Cyber Security, AI Engineering, Web Development, Autocad/Revit, and digital career tracks.</p>
            <a href="courses.html" class="cta-btn secondary">View Computer Courses</a>
        </article>
        <article class="featured-course-card">
            <h3>Coaching &amp; Languages</h3>
            <p>Matric &amp; FSc coaching plus English, Japanese, Korean, and Chinese language programs.</p>
            <a href="courses.html" class="cta-btn secondary">View All Courses</a>
        </article>
    </div>

    <section class="admission-cta-band" aria-labelledby="cta-heading">
        <h2 id="cta-heading">Admissions Are Open</h2>
        <p>Secure your seat for the next batch. Our admissions team will guide you on schedules, scholarships, and customized packages.</p>
        <div class="header-buttons" style="justify-content:center;">
            <a href="contact.html#apply" class="cta-btn">Apply Online</a>
            <a href="verify.html" class="cta-btn secondary">Verify Certificate</a>
        </div>
    </section>
    </main>
    </div>

` +
    footer +
    `    <script src="js/app.js" defer></script>
</body>
</html>
`
);

// ---------- about.html ----------
write(
  "about.html",
  head(
    "About TSI | The Spectrum Institute Barikot &amp; Mingora, Swat",
    "Vision, history, and facilities of The Spectrum Institute — technical and safety education in Barikot &amp; Mingora, Swat."
  ) +
    nav("About") +
    `    <div id="publicSiteShell">
` +
    chat +
    `    <main id="publicMain">
    <section class="page-band" aria-labelledby="about-heading">
        <div class="section-title" id="about-heading"><span>About The Spectrum Institute</span></div>
        <p class="page-lead">TSI is a professional education hub in Barikot &amp; Mingora, Swat, focused on industry-ready safety, computer, coaching, and language programs.</p>
    </section>

    <div class="about-story-grid">
        <article class="about-block">
            <h3>Our Vision</h3>
            <p>To make globally relevant technical and safety education accessible in Swat — so students can build careers locally and compete internationally.</p>
            <p style="margin-top:12px;">We combine practical labs, expert mentorship, and certification-focused pathways across HSE, IT, AI, and academic coaching.</p>
        </article>
        <article class="about-block">
            <h3>Our Story</h3>
            <p>Founded to close the skills gap in Barikot, TSI grew from a focused training desk into a multi-track institute covering Safety Engineering, Computer Courses, Matric/FSc coaching, and language programs.</p>
            <p style="margin-top:12px;">Today we serve students across Swat with scholarship support on selected ICT, Cyber Security, AI, and coaching tracks.</p>
        </article>
    </div>

    <section class="page-band" aria-labelledby="facilities-heading">
        <div class="section-title" id="facilities-heading"><span>Facility Highlights</span></div>
        <p class="page-lead">Learning spaces designed for practical mastery — not lecture-only classrooms.</p>
    </section>
    <div class="facility-grid">
        <article class="facility-card">
            <h3>Computer &amp; IT Labs</h3>
            <p>Hands-on stations for Cyber Security, AI Engineering, Web Development, Office suites, and design tools.</p>
        </article>
        <article class="facility-card">
            <h3>Safety Training Setup</h3>
            <p>Scenario-based HSE coaching for NEBOSH, IOSH, OSHA, Fire Safety, First Aid, and site protocols.</p>
        </article>
        <article class="facility-card">
            <h3>Academic Coaching Rooms</h3>
            <p>Focused Matric &amp; FSc subject rooms with faculty mentorship in Physics, Chemistry, Biology, Maths, and CS.</p>
        </article>
    </div>

${reviewsSection}
${faqSection}
    </main>
    </div>

` +
    footer +
    `    <script src="js/app.js" defer></script>
</body>
</html>
`
);

// ---------- courses.html ----------
write(
  "courses.html",
  head(
    "Courses | The Spectrum Institute TSI Swat",
    "Explore safety, computer, coaching, and language courses at The Spectrum Institute in Barikot, Swat."
  ) +
    nav("Courses") +
    `    <div id="publicSiteShell">
` +
    chat +
    `    <main id="publicMain">
    <section class="page-band" aria-labelledby="courses-page-heading">
        <div class="section-title" id="courses-page-heading"><span>Course Catalog</span></div>
        <p class="page-lead">Click any course for curriculum highlights and career pathways. Contact admissions for fees and batch schedules.</p>
    </section>
${coursesSection}
${timetableSection}
    </main>
    </div>

${syllabusModal}
` +
    footer +
    `    <script src="js/app.js" defer></script>
</body>
</html>
`
);

// ---------- faculty.html ----------
write(
  "faculty.html",
  head(
    "Faculty | The Spectrum Institute TSI Swat",
    "Meet the directors, instructors, and subject experts at The Spectrum Institute, Barikot &amp; Mingora, Swat."
  ) +
    nav("Faculty") +
    `    <div id="publicSiteShell">
` +
    chat +
    `    <main id="publicMain">
    <section class="page-band" aria-labelledby="faculty-heading">
        <div class="section-title" id="faculty-heading"><span>Our Faculty</span></div>
        <p class="page-lead">Leadership and instructors guiding safety, IT, AI, and academic excellence across TSI programs.</p>
    </section>
    <div class="faculty-page-grid">
        <article class="faculty-member-card">
            <div class="teacher-photo"><img src="teachers/bakhtzada.jpeg" alt="Sir Bakht Zada" style="object-position: center 15%;" onerror="this.parentElement.classList.add('no-photo')"></div>
            <h3>Sir Bakht Zada</h3>
            <p>Director</p>
        </article>
        <article class="faculty-member-card">
            <div class="teacher-photo"><img src="teachers/Abid_rasheed.jpeg" alt="Engr. Abid Rasheed" style="object-position: center 15%;" onerror="this.parentElement.classList.add('no-photo')"></div>
            <h3>Engr. Abid Rasheed</h3>
            <p>Chief Executive Officer / Founder</p>
        </article>
        <article class="faculty-member-card">
            <div class="teacher-photo"><img src="teachers/zaid_rasheed.jpeg" alt="Zaid Rasheed" style="object-position: center 15%;" onerror="this.parentElement.classList.add('no-photo')"></div>
            <h3>Zaid Rasheed</h3>
            <p>Managing Director</p>
        </article>
        <article class="faculty-member-card">
            <div class="teacher-photo"><img src="teachers/ubaid_rasheed.jpeg" alt="Engr. Ubaid Rasheed" style="object-position: center 30%;" onerror="this.parentElement.classList.add('no-photo')"></div>
            <h3>Engr. Ubaid Rasheed</h3>
            <p>HR Manager</p>
        </article>
        <article class="faculty-member-card">
            <div class="teacher-photo"><img src="teachers/sheraz_khan.jpeg" alt="Sheraz Khan" style="object-position: center 36%;" onerror="this.parentElement.classList.add('no-photo')"></div>
            <h3>Sheraz Khan</h3>
            <p>Expert in Autocad &amp; REVIT</p>
        </article>
        <article class="faculty-member-card">
            <div class="teacher-photo"><img src="teachers/mujeeb_ur_rahman.jpeg" alt="Mujeeb Ur Rahman" style="object-position: center 15%;" onerror="this.parentElement.classList.add('no-photo')"></div>
            <h3>Mujeeb Ur Rahman</h3>
            <p>Cybersecurity &amp; AI Expert</p>
        </article>
        <article class="faculty-member-card">
            <div class="teacher-photo"><img src="teachers/hayat_khan.jpeg" alt="Hayat Khan" style="object-position: center 25%;" onerror="this.parentElement.classList.add('no-photo')"></div>
            <h3>Hayat Khan</h3>
            <p>Health &amp; Safety</p>
        </article>
    </div>
    </main>
    </div>

` +
    footer +
    `    <script src="js/app.js" defer></script>
</body>
</html>
`
);

// ---------- contact.html ----------
write(
  "contact.html",
  head(
    "Contact &amp; Admissions | The Spectrum Institute TSI Swat",
    "Contact The Spectrum Institute in Barikot &amp; Mingora, Swat — inquiry form, map, and online admission portal."
  ) +
    nav("Contact") +
    `    <div id="publicSiteShell">
` +
    chat +
    `    <main id="publicMain">
    <section class="page-band" aria-labelledby="contact-heading">
        <div class="section-title" id="contact-heading"><span>Contact Us</span></div>
        <p class="page-lead">Reach admissions, safety, or IT desks directly — or send an inquiry and we will call you back.</p>
    </section>
    <div class="contact-info-grid">
        <article class="contact-info-card">
            <h3>Admissions</h3>
            <p><a href="tel:+923469709296">0346-9709296</a></p>
            <p><a href="https://wa.me/923469709296" target="_blank" rel="noopener">WhatsApp Admission Desk</a></p>
        </article>
        <article class="contact-info-card">
            <h3>Safety Desk</h3>
            <p><a href="tel:+923309151621">0330-9151621</a></p>
            <p><a href="https://wa.me/923309151621" target="_blank" rel="noopener">WhatsApp Safety Department</a></p>
        </article>
        <article class="contact-info-card">
            <h3>IT Hub</h3>
            <p><a href="tel:+923464792048">0346-4792048</a></p>
            <p><a href="mailto:info@tsi.com">info@tsi.com</a></p>
        </article>
    </div>
${inquirySection}
${applySection}
${mapSection}
    </main>
    </div>

` +
    footer +
    `    <script src="js/app.js" defer></script>
</body>
</html>
`
);

// ---------- verify.html ----------
write(
  "verify.html",
  head(
    "Verify Certificate | The Spectrum Institute TSI",
    "Verify a Spectrum Institute student certificate online using Certificate ID and identity details."
  ) +
    nav("Verify") +
    `    <div id="publicSiteShell">
` +
    chat +
    `    <main id="publicMain">
${verifySection}
    </main>
    </div>

${qrModal}
` +
    footer +
    `    <script src="https://unpkg.com/html5-qrcode" defer></script>
    <script src="js/app.js" defer></script>
</body>
</html>
`
);

// ---------- admin/login.html ----------
const adminHead = (title, extra = "") => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="robots" content="noindex, nofollow">
    <link rel="icon" type="image/png" sizes="32x32" href="../logo.png">
    <link rel="icon" type="image/png" sizes="192x192" href="../logo.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../logo.png">
    <link rel="shortcut icon" href="../logo.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/style.css">
${extra}</head>
`;

write(
  "admin/login.html",
  adminHead("Admin Login | The Spectrum Institute") +
    `<body class="auth-resolving">
    <div class="toast-container" id="toastContainer"></div>
    <header class="admin-standalone-nav">
        <a href="../index.html" class="nav-logo" id="nav-logo">TSI <span>Spectrum</span></a>
        <div class="admin-standalone-actions">
            <a href="../index.html" class="cta-btn secondary" style="padding:8px 14px;font-size:0.85rem;">← Back to Site</a>
            <button type="button" class="nav-mode-btn" id="themeToggleBtn" onclick="toggleLightMode()" aria-label="Switch to light mode" aria-pressed="false" title="Toggle light / dark mode">
                <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
                    <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 2.8v2.2M12 19v2.2M21.2 12h-2.2M5 12H2.8M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6M18.5 18.5l-1.6-1.6M7.1 7.1 5.5 5.5"/>
                </svg>
                <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M20.2 13.4A7.8 7.8 0 0 1 10.6 3.8 8.2 8.2 0 1 0 20.2 13.4z"/>
                </svg>
            </button>
        </div>
    </header>

    <main class="admin-login-page">
        <div class="admin-login-card" role="dialog" aria-labelledby="adminLoginTitle">
            <div class="modal-header">
                <h3 id="adminLoginTitle">Admin Access</h3>
            </div>
            <div class="modal-body admin-login-body">
                <p class="admin-login-subtitle">Sign in with your Spectrum Institute administrator credentials to open the secure console.</p>
                <form id="adminLoginForm">
                    <div class="form-group">
                        <label for="adminEmail">Admin Email</label>
                        <input type="email" id="adminEmail" name="email" autocomplete="username" placeholder="admin@spectruminstitute.pk" required>
                    </div>
                    <div class="form-group">
                        <label for="adminPassword">Password</label>
                        <input type="password" id="adminPassword" name="password" autocomplete="current-password" placeholder="Enter your password" required>
                    </div>
                    <p class="admin-login-error" id="adminLoginError" hidden></p>
                    <button type="submit" class="submit-btn admin-login-submit" id="adminLoginSubmitBtn">Sign In Securely</button>
                </form>
            </div>
        </div>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
    <script src="../js/admin-auth.js" defer></script>
    <script src="../js/app.js" defer></script>
</body>
</html>
`
);

// ---------- admin/dashboard.html ----------
write(
  "admin/dashboard.html",
  adminHead(
    "Admin Dashboard | The Spectrum Institute",
    `    <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
`
  ) +
    `<body class="auth-resolving admin-page">
    <div class="toast-container" id="toastContainer"></div>

    <nav class="main-navbar" aria-label="Admin">
        <div class="nav-container">
            <a href="../index.html" class="nav-logo" id="nav-logo" title="The Spectrum Institute">TSI <span>Spectrum</span></a>
            <div class="nav-controls">
                <ul class="nav-links admin-nav-links" id="adminNavLinks">
                    <li><span class="admin-nav-label">Admin Console</span></li>
                    <li><span class="admin-nav-email" id="adminNavEmail"></span></li>
                    <li class="admin-nav-tabs" aria-hidden="true">
                        <button type="button" class="admin-nav-tab-chip" onclick="switchAdminTab('students')">Students</button>
                        <button type="button" class="admin-nav-tab-chip" onclick="switchAdminTab('courses')">Courses</button>
                        <button type="button" class="admin-nav-tab-chip" onclick="switchAdminTab('certificates')">Certificates</button>
                        <button type="button" class="admin-nav-tab-chip" onclick="switchAdminTab('leads')">Leads</button>
                    </li>
                    <li><button type="button" class="cta-btn nav-logout-btn" onclick="handleAdminLogout()">Logout</button></li>
                </ul>
                <button type="button" class="nav-mode-btn" id="themeToggleBtn" onclick="toggleLightMode()" aria-label="Switch to light mode" aria-pressed="false" title="Toggle light / dark mode">
                    <svg class="theme-icon theme-icon-sun" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" stroke-width="1.8"/>
                        <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M12 2.8v2.2M12 19v2.2M21.2 12h-2.2M5 12H2.8M18.5 5.5l-1.6 1.6M7.1 16.9l-1.6 1.6M18.5 18.5l-1.6-1.6M7.1 7.1 5.5 5.5"/>
                    </svg>
                    <svg class="theme-icon theme-icon-moon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" d="M20.2 13.4A7.8 7.8 0 0 1 10.6 3.8 8.2 8.2 0 1 0 20.2 13.4z"/>
                    </svg>
                </button>
            </div>
        </div>
    </nav>

${adminDashboard}
${csvModal}
${certPreviewModal}

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
    <script src="https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js" defer></script>
    <script src="../js/admin-auth.js" defer></script>
    <script src="../js/app.js" defer></script>
</body>
</html>
`
);

console.log("All portal pages generated.");
