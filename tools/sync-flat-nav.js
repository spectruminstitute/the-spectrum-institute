/**
 * Propagate flat navbar: Home | About▾ | Academics▾ | Admissions | Verification | Contact
 * Run: node tools/sync-flat-nav.js
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

function navMarkup(activeFile = "") {
  const isActive = (file) => (activeFile === file ? ' class="is-active"' : "");
  const aboutActive = ["overview.html", "vc-message.html", "vision-mission.html", "rules.html", "research.html", "about.html"].includes(activeFile);
  const academicsActive = ["courses.html", "faculties.html", "faculty.html", "alumni.html"].includes(activeFile);

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
                    <li><a href="admissions.html"${isActive("admissions.html")}>Admissions</a></li>
                    <li><a href="verify.html"${isActive("verify.html")}>Verification</a></li>
                    <li><a href="contact.html"${isActive("contact.html")}>Contact</a></li>
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

function patchNavInFile(fileName) {
  const full = path.join(root, fileName);
  if (!fs.existsSync(full)) return;
  let html = fs.readFileSync(full, "utf8");
  const start = html.indexOf('<div class="toast-container" id="toastContainer"></div>');
  const end = html.indexOf("</nav>");
  if (start < 0 || end < 0 || end < start) {
    console.warn("skip", fileName);
    return;
  }
  html = html.slice(0, start) + navMarkup(fileName) + html.slice(end + "</nav>".length);
  html = html.split("contact.html#apply").join("admissions.html#apply");
  fs.writeFileSync(full, html, "utf8");
  console.log("patched", fileName);
}

const files = fs.readdirSync(root).filter((f) => f.endsWith(".html"));
files.forEach(patchNavInFile);
console.log("Flat nav sync complete.");
