const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'css', 'style.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Remove previously appended navDropdownFixes if present to keep style.css clean
const splitMarker = '/* ==========================================================================\n   Navigation Dropdown Menu & Active/Hover Navbar Contrast Enhancements';
if (css.includes(splitMarker)) {
    css = css.split(splitMarker)[0].trimEnd();
}

const cleanNavigationStyles = `
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

/* ==========================================================================
   DESKTOP NAVIGATION (min-width: 769px)
   ========================================================================== */
@media (min-width: 769px) {
    /* Top-Level Links & Dropdown Toggles */
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

    /* Dropdown Menu Container (Desktop Floating Dark Navy Card) */
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

    /* Desktop Dropdown Link Items — High-Contrast Default State */
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

    /* Desktop Dropdown Link Items — Hover State */
    .nav-dropdown-menu a:hover,
    .nav-dropdown-menu li a:hover {
        background: rgba(201, 161, 59, 0.25) !important;
        color: #ffd700 !important;
        transform: translateX(4px) !important;
    }

    /* Desktop Dropdown Link Items — Active Page State */
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
}

/* ==========================================================================
   MOBILE NAVIGATION DRAWER & SUBMENU (max-width: 768px)
   ========================================================================== */
@media (max-width: 768px) {
    /* Mobile Drawer Container */
    .nav-links {
        background: #ffffff !important;
        border: 1px solid #e4dbc5 !important;
        border-radius: 0 0 18px 18px !important;
        box-shadow: 0 22px 48px rgba(0, 0, 0, 0.18) !important;
        padding: 1.25rem 1rem !important;
        z-index: 9999 !important;
        display: none;
        flex-direction: column !important;
        gap: 6px !important;
    }

    .nav-links.is-open {
        display: flex !important;
    }

    .nav-links > li {
        width: 100% !important;
        list-style: none !important;
        margin: 0 !important;
    }

    /* Top-Level Mobile Items */
    .nav-links > li > a,
    .nav-dropdown-toggle {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        width: 100% !important;
        min-height: 46px !important;
        text-align: left !important;
        padding: 12px 16px !important;
        border-radius: 10px !important;
        color: #0f172a !important;
        font-size: 1rem !important;
        font-weight: 700 !important;
        text-decoration: none !important;
        border: 1px solid transparent !important;
        background: transparent !important;
        box-sizing: border-box !important;
        transition: all 0.2s ease !important;
    }

    .nav-links > li > a:hover,
    .nav-dropdown-toggle:hover {
        background: #f1f5f9 !important;
        color: #c9a13b !important;
    }

    /* Top-Level Active State */
    .nav-links > li > a.is-active,
    .nav-dropdown.is-current > .nav-dropdown-toggle {
        background: #0c1830 !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        border-radius: 10px !important;
    }

    .nav-dropdown-toggle::after {
        content: "" !important;
        display: inline-block !important;
        width: 0 !important;
        height: 0 !important;
        border-left: 5px solid transparent !important;
        border-right: 5px solid transparent !important;
        border-top: 6px solid currentColor !important;
        opacity: 0.8 !important;
        transition: transform 0.25s ease !important;
        margin-left: 8px !important;
    }

    .nav-dropdown.is-open > .nav-dropdown-toggle::after {
        transform: rotate(180deg) !important;
    }

    /* Mobile Submenu Container */
    .nav-dropdown-menu {
        position: static !important;
        transform: none !important;
        opacity: 1 !important;
        visibility: visible !important;
        display: none !important;
        width: 100% !important;
        min-width: 0 !important;
        margin: 6px 0 10px !important;
        padding: 8px 6px !important;
        background: #f8fafc !important;
        border: 1px solid #e2e8f0 !important;
        border-radius: 12px !important;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.02) !important;
        flex-direction: column !important;
        gap: 4px !important;
        box-sizing: border-box !important;
    }

    .nav-dropdown.is-open > .nav-dropdown-menu {
        display: flex !important;
    }

    .nav-dropdown-menu li {
        width: 100% !important;
        list-style: none !important;
        margin: 0 !important;
    }

    /* Mobile Submenu Link Items — Dark Readable Text & Left Indent */
    .nav-dropdown-menu a,
    .nav-dropdown-menu li a {
        display: flex !important;
        align-items: center !important;
        width: 100% !important;
        min-height: 42px !important;
        padding: 10px 14px 10px 20px !important;
        border-radius: 8px !important;
        color: #0f172a !important;
        font-size: 0.94rem !important;
        font-weight: 600 !important;
        text-decoration: none !important;
        background: transparent !important;
        box-sizing: border-box !important;
        transition: all 0.2s ease !important;
        position: relative !important;
    }

    /* Subtle bullet indicator for clear mobile visual hierarchy */
    .nav-dropdown-menu a::before,
    .nav-dropdown-menu li a::before {
        content: "•" !important;
        color: #c9a13b !important;
        font-size: 1.3rem !important;
        line-height: 1 !important;
        margin-right: 8px !important;
        display: inline-block !important;
    }

    /* Mobile Submenu Hover */
    .nav-dropdown-menu a:hover,
    .nav-dropdown-menu li a:hover {
        background: #e2e8f0 !important;
        color: #0c1830 !important;
        transform: none !important;
    }

    /* Mobile Submenu Active */
    .nav-dropdown-menu a.is-active,
    .nav-dropdown-menu li a.is-active {
        background: #c9a13b !important;
        color: #0c1830 !important;
        font-weight: 700 !important;
    }

    .nav-dropdown-menu a.is-active::before,
    .nav-dropdown-menu li a.is-active::before {
        color: #0c1830 !important;
    }
}
`;

css += '\n' + cleanNavigationStyles;
fs.writeFileSync(cssPath, css, 'utf8');
console.log('Successfully updated mobile and desktop navigation styles in css/style.css');
