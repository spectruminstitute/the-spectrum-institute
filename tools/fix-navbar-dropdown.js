const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

const navDropdownFixes = `
/* ==========================================================================
   Navigation Dropdown Menu & Active/Hover Navbar Contrast Enhancements
   ========================================================================== */

/* Main Navbar Sticky & Layering */
.main-navbar {
    position: sticky !important;
    top: 0 !important;
    background: linear-gradient(90deg, #c9a13b, #e9c46a) !important;
    backdrop-filter: none !important;
    border-bottom: 2px solid #8a651f !important;
    z-index: 9999 !important;
}

/* Desktop Navbar Top-Level Links & Dropdown Toggles */
@media (min-width: 769px) {
    .main-navbar .nav-links > li > a,
    .main-navbar .nav-dropdown-toggle {
        color: #ffffff !important;
        font-size: 0.92rem !important;
        font-weight: 600 !important;
        padding: 8px 14px !important;
        border-radius: 8px !important;
        display: inline-flex !important;
        align-items: center !important;
        gap: 6px !important;
        transition: all 0.22s ease !important;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15) !important;
    }

    .main-navbar .nav-links > li > a:hover,
    .main-navbar .nav-dropdown-toggle:hover {
        color: #0c1830 !important;
        background: rgba(255, 255, 255, 0.35) !important;
        text-shadow: none !important;
    }

    /* Active top-level links & active dropdown toggles */
    .main-navbar .nav-links > li > a.is-active,
    .main-navbar .nav-dropdown.is-current > .nav-dropdown-toggle,
    .main-navbar .nav-dropdown-toggle.is-active {
        background: #0c1830 !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        box-shadow: 0 4px 12px rgba(12, 24, 48, 0.25) !important;
        text-shadow: none !important;
    }

    .main-navbar .nav-dropdown.is-current > .nav-dropdown-toggle:hover {
        background: #14213d !important;
        color: #ffffff !important;
    }
}

/* Dropdown Toggle Arrow */
.nav-dropdown-toggle::after {
    content: "" !important;
    display: inline-block !important;
    width: 0 !important;
    height: 0 !important;
    border-left: 4px solid transparent !important;
    border-right: 4px solid transparent !important;
    border-top: 5px solid currentColor !important;
    opacity: 0.9 !important;
    transition: transform 0.25s ease !important;
    margin-left: 2px !important;
}

.nav-dropdown:hover > .nav-dropdown-toggle::after,
.nav-dropdown.is-open > .nav-dropdown-toggle::after {
    transform: rotate(180deg) !important;
}

/* Dropdown Menu Container (Desktop) */
.nav-dropdown-menu {
    list-style: none !important;
    margin: 0 !important;
    padding: 10px 8px !important;
    min-width: 230px !important;
    position: absolute !important;
    top: calc(100% + 10px) !important;
    left: 50% !important;
    transform: translateX(-50%) translateY(8px) scale(0.98) !important;
    opacity: 0 !important;
    visibility: hidden !important;
    pointer-events: none !important;
    border-radius: 14px !important;
    border: 1px solid rgba(201, 161, 59, 0.45) !important;
    background: #0c1830 !important;
    backdrop-filter: blur(16px) saturate(140%) !important;
    box-shadow: 0 20px 45px rgba(0, 0, 0, 0.4), 0 4px 12px rgba(0, 0, 0, 0.25) !important;
    transition: opacity 0.22s ease, transform 0.22s ease, visibility 0.22s ease !important;
    z-index: 10000 !important;
}

.nav-dropdown:hover > .nav-dropdown-menu,
.nav-dropdown:focus-within > .nav-dropdown-menu,
.nav-dropdown.is-open > .nav-dropdown-menu {
    opacity: 1 !important;
    visibility: visible !important;
    pointer-events: auto !important;
    transform: translateX(-50%) translateY(0) scale(1) !important;
}

/* Dropdown Menu Link Items — High-Contrast Default State */
.nav-dropdown-menu li {
    list-style: none !important;
    margin: 0 0 3px 0 !important;
}

.nav-dropdown-menu li:last-child {
    margin-bottom: 0 !important;
}

.nav-dropdown-menu a,
.nav-dropdown-menu li a {
    display: block !important;
    padding: 10px 14px !important;
    border-radius: 8px !important;
    color: #ffffff !important;
    text-decoration: none !important;
    font-size: 0.92rem !important;
    font-weight: 500 !important;
    letter-spacing: 0.2px !important;
    transition: all 0.2s ease !important;
    background: transparent !important;
}

/* Dropdown Menu Link Items — Hover State */
.nav-dropdown-menu a:hover,
.nav-dropdown-menu li a:hover {
    background: rgba(201, 161, 59, 0.25) !important;
    color: #ffd700 !important;
    transform: translateX(4px) !important;
}

/* Dropdown Menu Link Items — Active Page State */
.nav-dropdown-menu a.is-active,
.nav-dropdown-menu li a.is-active {
    background: #c9a13b !important;
    color: #0c1830 !important;
    font-weight: 700 !important;
    box-shadow: 0 4px 12px rgba(201, 161, 59, 0.35) !important;
    transform: none !important;
}

.nav-dropdown-menu a.is-active:hover,
.nav-dropdown-menu li a.is-active:hover {
    background: #e9c46a !important;
    color: #0c1830 !important;
}

/* Mobile Drawer (<= 768px) */
@media (max-width: 768px) {
    .nav-links {
        background: #ffffff !important;
        border: 1px solid #e4dbc5 !important;
        border-radius: 0 0 18px 18px !important;
        box-shadow: 0 22px 48px rgba(0, 0, 0, 0.18) !important;
        padding: 1.25rem !important;
        z-index: 9999 !important;
    }

    .nav-links > li > a,
    .nav-dropdown-toggle {
        color: #0c1830 !important;
        font-size: 0.98rem !important;
        font-weight: 600 !important;
        padding: 12px 14px !important;
        border-radius: 10px !important;
        text-shadow: none !important;
    }

    .nav-links > li > a:hover,
    .nav-dropdown-toggle:hover {
        background: #f1f5f9 !important;
        color: #c9a13b !important;
    }

    .nav-links > li > a.is-active,
    .nav-dropdown.is-current > .nav-dropdown-toggle {
        background: #0c1830 !important;
        color: #ffffff !important;
        font-weight: 700 !important;
    }

    .nav-dropdown-menu {
        position: static !important;
        transform: none !important;
        opacity: 1 !important;
        visibility: visible !important;
        display: none !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 6px 0 10px !important;
        padding: 8px !important;
        background: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 10px !important;
        box-shadow: none !important;
    }

    .nav-dropdown.is-open > .nav-dropdown-menu {
        display: block !important;
    }

    .nav-dropdown-menu a,
    .nav-dropdown-menu li a {
        color: #0c1830 !important;
        font-weight: 600 !important;
        padding: 10px 12px !important;
        border-radius: 6px !important;
    }

    .nav-dropdown-menu a:hover,
    .nav-dropdown-menu li a:hover {
        background: #e2e8f0 !important;
        color: #0c1830 !important;
        transform: none !important;
    }

    .nav-dropdown-menu a.is-active,
    .nav-dropdown-menu li a.is-active {
        background: #c9a13b !important;
        color: #0c1830 !important;
        font-weight: 700 !important;
    }
}
`;

css += '\n' + navDropdownFixes;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully appended navigation dropdown fixes to css/style.css');
