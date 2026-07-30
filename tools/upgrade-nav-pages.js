/**
 * Generate enterprise interior pages + patch navbar across all public HTML.
 * Run: node tools/upgrade-nav-pages.js
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function head(title, description) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="author" content="The Spectrum Institute">
    <meta name="robots" content="index, follow, max-image-preview:large">
    <link rel="icon" type="image/png" href="logo.png?v=2" sizes="32x32">
    <link rel="apple-touch-icon" href="logo.png?v=2">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&family=Space+Grotesk:wght@500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/style.css">
</head>
<body>
`;
}

function navMarkup(activeFile = "") {
  const isActive = (file) => (activeFile === file ? ' class="is-active"' : "");
  const aboutActive = ["overview.html", "vc-message.html", "vision-mission.html", "rules.html", "research.html", "about.html"].includes(activeFile);
  const academicsActive = ["courses.html", "faculties.html", "faculty.html", "alumni.html"].includes(activeFile);
  const admissionsActive = ["admissions.html", "contact.html", "verify.html"].includes(activeFile);

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
                    <li><a href="index.html"${isActive("index.html")}>Home</a></li>
                    <li class="nav-dropdown${aboutActive ? " is-current" : ""}">
                        <button type="button" class="nav-dropdown-toggle${aboutActive ? " is-active" : ""}" aria-expanded="false" aria-haspopup="true">About TSI</button>
                        <ul class="nav-dropdown-menu" role="menu">
                            <li role="none"><a role="menuitem" href="overview.html"${isActive("overview.html")}>Overview</a></li>
                            <li role="none"><a role="menuitem" href="vc-message.html"${isActive("vc-message.html")}>Director's Message</a></li>
                            <li role="none"><a role="menuitem" href="vision-mission.html"${isActive("vision-mission.html")}>Vision &amp; Mission</a></li>
                            <li role="none"><a role="menuitem" href="rules.html"${isActive("rules.html")}>Rules &amp; Conduct</a></li>
                            <li role="none"><a role="menuitem" href="research.html"${isActive("research.html")}>Research &amp; Innovation</a></li>
                            <li role="none"><a role="menuitem" href="about.html"${isActive("about.html")}>Institute Story</a></li>
                        </ul>
                    </li>
                    <li class="nav-dropdown${academicsActive ? " is-current" : ""}">
                        <button type="button" class="nav-dropdown-toggle${academicsActive ? " is-active" : ""}" aria-expanded="false" aria-haspopup="true">Academics</button>
                        <ul class="nav-dropdown-menu" role="menu">
                            <li role="none"><a role="menuitem" href="courses.html"${isActive("courses.html")}>Courses</a></li>
                            <li role="none"><a role="menuitem" href="faculties.html"${isActive("faculties.html")}>Faculties</a></li>
                            <li role="none"><a role="menuitem" href="faculty.html"${isActive("faculty.html")}>Faculty Profiles</a></li>
                            <li role="none"><a role="menuitem" href="alumni.html"${isActive("alumni.html")}>Alumni</a></li>
                        </ul>
                    </li>
                    <li class="nav-dropdown${admissionsActive ? " is-current" : ""}">
                        <button type="button" class="nav-dropdown-toggle${admissionsActive ? " is-active" : ""}" aria-expanded="false" aria-haspopup="true">Admissions</button>
                        <ul class="nav-dropdown-menu" role="menu">
                            <li role="none"><a role="menuitem" href="admissions.html"${isActive("admissions.html")}>Admission Guide</a></li>
                            <li role="none"><a role="menuitem" href="contact.html"${isActive("contact.html")}>Apply / Contact</a></li>
                            <li role="none"><a role="menuitem" href="verify.html"${isActive("verify.html")}>Verify Certificate</a></li>
                        </ul>
                    </li>
                    <li><a href="contact.html">Contact</a></li>
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
                    <div class="dept-meta"><font>Admission Desk</font><span>Online | Response instant</span></div>
                </a>
                <a href="https://wa.me/923309151621?text=Hi,%20I%20have%20a%20query%20about%20Safety%20Courses." target="_blank" class="dept-item">
                    <div class="dept-avatar">🛡️</div>
                    <div class="dept-meta"><font>Safety Department</font><span>Online | Response within minutes</span></div>
                </a>
                <a href="https://wa.me/923464792048?text=Hi,%20I%20want%20to%20talk%20to%20the%20IT%20Head." target="_blank" class="dept-item">
                    <div class="dept-avatar">💻</div>
                    <div class="dept-meta"><font>IT Hub Desk</font><span>Available | Ask technical questions</span></div>
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
        <p class="footer-seo-copy">The Spectrum Institute is the <strong>Best Technical and Professional Education Institute in Barikot &amp; Mingora, Swat</strong>.</p>
    </footer>

    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
    <script src="js/app.js" defer></script>
</body>
</html>
`;

function interiorPage({ file, title, description, heading, lead, panels }) {
  const panelsHtml = panels
    .map(
      (p) => `        <article class="interior-panel reveal-on-scroll">
            <h3>${p.title}</h3>
            <p>${p.body}</p>
            ${p.list ? `<ul class="interior-list">${p.list.map((i) => `<li>${i}</li>`).join("")}</ul>` : ""}
        </article>`
    )
    .join("\n");

  return (
    head(title, description) +
    navMarkup(file) +
    `    <div id="publicSiteShell">
` +
    chat +
    `    <main id="publicMain">
    <section class="page-band" aria-labelledby="page-heading">
        <div class="section-title" id="page-heading"><span>${heading}</span></div>
        <p class="page-lead">${lead}</p>
    </section>
    <div class="interior-grid">
${panelsHtml}
    </div>
    <section class="admission-cta-band reveal-on-scroll">
        <h2>Ready to join TSI?</h2>
        <p>Speak with admissions for batch schedules, scholarships, and customized learning packages.</p>
        <div class="header-buttons" style="justify-content:center;">
            <a href="contact.html#apply" class="cta-btn">Apply Online</a>
            <a href="admissions.html" class="cta-btn secondary">Admission Guide</a>
        </div>
    </section>
    </main>
    </div>

` +
    footer
  );
}

const pages = [
  {
    file: "overview.html",
    title: "Overview | The Spectrum Institute",
    description: "Institute background, scale, and academic footprint of The Spectrum Institute in Barikot Swat.",
    heading: "Institute Overview",
    lead: "The Spectrum Institute (TSI) is a professional technical education hub serving Barikot and the wider Swat region with industry-aligned programs.",
    panels: [
      { title: "Who We Are", body: "TSI delivers practical pathways in Safety Engineering, Computer & AI skills, academic coaching, and language learning — built for employability and professional growth." },
      { title: "Our Scale", body: "From foundational computer literacy to advanced NEBOSH and AI Engineering tracks, TSI hosts multi-shift batches guided by specialized faculty leads.", list: ["40+ professional courses", "Safety, IT, Coaching & Language tracks", "Scholarship support on selected programs"] },
      { title: "Campus Focus", body: "Learning spaces emphasize labs, mentoring, and certification readiness rather than lecture-only delivery — preparing students for local and Gulf market roles." }
    ]
  },
  {
    file: "vc-message.html",
    title: "Director's Message | The Spectrum Institute",
    description: "Message from the Director / Principal of The Spectrum Institute, Barikot Swat.",
    heading: "Director's Message",
    lead: "A note from TSI leadership on purpose, professionalism, and the students we serve.",
    panels: [
      { title: "Welcome to TSI", body: "Dear students and parents — The Spectrum Institute was founded to bring globally relevant technical and safety education to Barikot. Our promise is disciplined training, honest mentoring, and pathways that open real opportunities." },
      { title: "Our Commitment", body: "Whether you join for NEBOSH, Cyber Security, AI Engineering, or FSc coaching, you will find faculty who care about clarity, practice, and character. Education here is not a transaction — it is a responsibility.", list: ["Skill with integrity", "Practice before certificates", "Service to Swat's youth"] },
      { title: "Looking Ahead", body: "We continue expanding labs, industry linkages, and scholarship access so every motivated learner in our community can compete with confidence. — Leadership, The Spectrum Institute" }
    ]
  },
  {
    file: "vision-mission.html",
    title: "Vision & Mission | The Spectrum Institute",
    description: "Core vision, mission, and values of The Spectrum Institute (TSI) Barikot Swat.",
    heading: "Vision, Mission & Values",
    lead: "The principles that guide every course, classroom, and student journey at TSI.",
    panels: [
      { title: "Vision", body: "To be Swat's most trusted institute for professional technical, safety, and digital education — producing graduates ready for national and international workplaces." },
      { title: "Mission", body: "Deliver accessible, certification-focused training through expert faculty, practical labs, and student-centered mentoring across Safety, IT/AI, Coaching, and Languages." },
      { title: "Core Values", body: "We measure success by competence and character.", list: ["Excellence in teaching", "Integrity in assessment", "Accessibility & scholarships", "Innovation with responsibility"] }
    ]
  },
  {
    file: "rules.html",
    title: "Rules & Code of Conduct | The Spectrum Institute",
    description: "Statutes, campus rules, and student code of conduct at The Spectrum Institute.",
    heading: "Rules & Code of Conduct",
    lead: "A respectful, professional learning environment keeps every batch productive and fair.",
    panels: [
      { title: "Attendance & Punctuality", body: "Students are expected to attend scheduled sessions on time. Repeated absences may affect assessment eligibility and certificate issuance for the enrolled track." },
      { title: "Campus Conduct", body: "Mutual respect for faculty, staff, and peers is mandatory. Harassment, academic dishonesty, or misuse of lab equipment is subject to disciplinary review.", list: ["Follow lab safety protocols", "No disruptive behavior in classes", "Protect institute property and data"] },
      { title: "Assessments & Certificates", body: "Certificates are issued only after successful completion of required modules and verification of student identity. Fraudulent claims are strictly prohibited." }
    ]
  },
  {
    file: "research.html",
    title: "Research & Innovation | The Spectrum Institute",
    description: "R&D and Innovation cell initiatives at The Spectrum Institute, Barikot Swat.",
    heading: "Research & Innovation Cell",
    lead: "Exploring applied projects that connect classroom learning with real technical challenges.",
    panels: [
      { title: "Applied Learning Labs", body: "Students in AI, Cyber Security, and Web Development work on mini-projects that mirror freelance and industry briefs — from secure network basics to practical automation." },
      { title: "Safety Practice Studio", body: "HSE cohorts rehearse risk assessment, emergency response, and site-safety documentation aligned with international certification standards." },
      { title: "Innovation Goals", body: "The cell encourages student showcases, peer mentoring, and collaboration with local workplaces to turn skills into portfolios and employment outcomes." }
    ]
  },
  {
    file: "admissions.html",
    title: "Admissions | The Spectrum Institute",
    description: "Admission criteria, schedules, and specialized tech tracks at The Spectrum Institute.",
    heading: "Admissions Guide",
    lead: "How to join TSI — eligibility, intake rhythm, and high-demand technical tracks.",
    panels: [
      { title: "Eligibility", body: "Most professional tracks welcome motivated learners with basic literacy. Advanced IT and Safety programs may recommend Matric / Intermediate or relevant prior exposure — our admissions desk will advise per course." },
      { title: "Intake & Schedule", body: "New batches open on a rolling basis for morning, afternoon, and evening shifts. Contact admissions for the latest timetable and scholarship windows." },
      { title: "Specialized Tech Tracks", body: "Priority pathways currently include:", list: ["AI Engineering", "Cyber Security", "Web & Software Development", "Autocad / Revit / SketchUp", "NEBOSH / IOSH / OSHA Safety diplomas"] },
      { title: "How to Apply", body: "Submit the online admission form or inquiry on our Contact page, or WhatsApp the Admission Desk for a same-day callback." }
    ]
  },
  {
    file: "faculties.html",
    title: "Faculties | The Spectrum Institute",
    description: "Department breakdown — Faculty of IT, Computer Engineering & Vocational Skills at TSI.",
    heading: "Our Faculties",
    lead: "Academic departments organized around professional outcomes and practical mastery.",
    panels: [
      { title: "Faculty of Information Technology", body: "Covers Cyber Security, AI Engineering, ICT, Programming, Databases, Digital Marketing, and Office productivity tracks with lab-first delivery." },
      { title: "Faculty of Computer Engineering & Design", body: "Focuses on Web & Software Development, Graphics, Autocad, Revit, and SketchUp — building drafting and digital product skills for construction and creative markets." },
      { title: "Faculty of Vocational & Safety Skills", body: "Delivers NEBOSH, IOSH, OSHA, Fire Safety, First Aid, and related HSE credentials for industrial and Gulf-ready careers." },
      { title: "Academic Coaching Wing", body: "Supports Matric & FSc subjects plus language programs (English, Japanese, Korean, Chinese) for school and overseas pathways." }
    ]
  },
  {
    file: "alumni.html",
    title: "Alumni | The Spectrum Institute",
    description: "Alumni Association and success stories from The Spectrum Institute, Barikot Swat.",
    heading: "Alumni Association",
    lead: "Graduates of TSI continue into freelancing, industry roles, and further certifications — and stay connected with the institute.",
    panels: [
      { title: "Success Pathways", body: "Alumni from AI, Cyber Security, and Safety tracks report freelance gigs, site-safety roles, and stronger academic foundations after coaching — proof that practical training travels beyond the classroom." },
      { title: "Stay Connected", body: "The Alumni Association helps graduates mentor juniors, share opportunities, and return as guest speakers for new batches." },
      { title: "Share Your Story", body: "If you studied at TSI, contact admissions to join the alumni network and inspire the next cohort." }
    ]
  }
];

for (const page of pages) {
  fs.writeFileSync(path.join(root, page.file), interiorPage(page), "utf8");
  console.log("wrote", page.file);
}

/** Replace navbar block in existing public pages (between toast-container and end of </nav>). */
function patchNavInFile(fileName) {
  const full = path.join(root, fileName);
  if (!fs.existsSync(full)) return;
  let html = fs.readFileSync(full, "utf8");
  const start = html.indexOf('<div class="toast-container" id="toastContainer"></div>');
  const end = html.indexOf("</nav>");
  if (start < 0 || end < 0 || end < start) {
    console.warn("skip nav patch", fileName);
    return;
  }
  const afterNav = end + "</nav>".length;
  html = html.slice(0, start) + navMarkup(fileName) + html.slice(afterNav);
  fs.writeFileSync(full, html, "utf8");
  console.log("patched nav", fileName);
}

[
  "index.html",
  "about.html",
  "courses.html",
  "faculty.html",
  "contact.html",
  "verify.html"
].forEach(patchNavInFile);

console.log("Navbar upgrade complete.");
