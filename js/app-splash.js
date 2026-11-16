// The Spectrum Institute (TSI) - app splash screen
// Shown when the site is opened as an INSTALLED APP (phone home screen / desktop app),
// once per app launch. Not shown in a normal browser tab.
//   Blue sky, the sun rises from the bottom-left corner -> sunlight hits a prism ->
//   the prism splits it into a rainbow -> the rainbow writes "SPECTRUM".
// Test in a normal browser:  index.html?splash=1
// Tap anywhere to skip. Respects "reduce motion".
(function () {
  "use strict";
  var w = window, d = document;

  var forced = /[?&]splash=1\b/.test(location.search);
  var standalone = false;
  try {
    standalone = ["standalone", "fullscreen", "minimal-ui", "window-controls-overlay"].some(function (m) {
      return w.matchMedia && w.matchMedia("(display-mode: " + m + ")").matches;
    }) || w.navigator.standalone === true;
  } catch (e) {}
  var seen = false;
  try { seen = sessionStorage.getItem("tsi-splash") === "1"; } catch (e) {}
  if (!forced && (!standalone || seen)) return;
  try { sessionStorage.setItem("tsi-splash", "1"); } catch (e) {}

  var reduce = false;
  try { reduce = w.matchMedia("(prefers-reduced-motion: reduce)").matches; } catch (e) {}
  var TOTAL = reduce ? 1200 : 3900;

  // Cover the page straight away (this file is loaded in <head>), so the site never flashes first.
  var css = [
    "html.tsi-splashing,html.tsi-splashing body{overflow:hidden!important;background:#0b4fb5!important}",
    "html.tsi-splashing body>*:not(#tsi-splash),html.tsi-splashing body>*:not(#tsi-splash) *{visibility:hidden!important}",
    "#tsi-splash{position:fixed;inset:0;z-index:2147483647;display:flex;align-items:center;justify-content:center;",
    "background:linear-gradient(180deg,#0b4fb5 0%,#2a7fe0 30%,#8cc8f6 52%,#e6f4ff 68%,#ffffff 100%);",
    "transition:opacity .45s ease,visibility .45s ease;-webkit-tap-highlight-color:transparent;cursor:pointer}",
    "#tsi-splash.out{opacity:0;visibility:hidden}",
    "#tsi-splash svg{width:100%;height:100%;max-width:520px;display:block}",
    "#tsi-splash .cloud{animation:tsiDrift 9s ease-in-out infinite alternate}#tsi-splash .cloud.c2{animation-duration:12s;animation-delay:-3s}",
    "@keyframes tsiDrift{0%{transform:translateX(-14px)}100%{transform:translateX(14px)}}",
    "#tsi-splash .rays{transform-box:view-box;transform-origin:82px 150px;animation:tsiSpin 24s linear infinite}@keyframes tsiSpin{to{transform:rotate(360deg)}}",
    "#tsi-splash .moon{animation:tsiRise 1.45s cubic-bezier(.2,.75,.25,1) both}",
    "@keyframes tsiRise{0%{transform:translate(-190px,560px)}55%{transform:translate(-50px,140px)}100%{transform:translate(0,0)}}",
    "#tsi-splash .halo{transform-box:fill-box;transform-origin:center;animation:tsiBreathe 3s 1.4s ease-in-out infinite}",
    "@keyframes tsiBreathe{0%,100%{transform:scale(1);opacity:.75}50%{transform:scale(1.12);opacity:1}}",
    "#tsi-splash .beam{stroke-dasharray:200;stroke-dashoffset:200;animation:tsiDraw .5s 1.3s ease-out forwards}",
    "#tsi-splash .beamGlow,#tsi-splash .inner{opacity:0;animation:tsiFade .5s 1.35s ease-out forwards}",
    "#tsi-splash .inner{animation-delay:1.75s;animation-duration:.3s}",
    "@keyframes tsiDraw{to{stroke-dashoffset:0}}@keyframes tsiFade{to{opacity:1}}",
    "#tsi-splash .prism{opacity:0;transform-box:fill-box;transform-origin:50% 100%;animation:tsiPIn .7s .35s cubic-bezier(.2,.9,.3,1.25) forwards}",
    "@keyframes tsiPIn{0%{opacity:0;transform:translateY(14px) scale(.85)}100%{opacity:1;transform:none}}",
    "#tsi-splash .flash{opacity:0;animation:tsiFlash .7s 1.75s ease-out forwards}",
    "@keyframes tsiFlash{0%{opacity:0}35%{opacity:1}100%{opacity:.35}}",
    "#tsi-splash .fan{transform-box:view-box;transform-origin:180px 316px;transform:scaleY(0);opacity:0;animation:tsiFan .65s 1.85s cubic-bezier(.2,.8,.3,1) forwards}",
    "@keyframes tsiFan{0%{transform:scaleY(0);opacity:0}100%{transform:scaleY(1);opacity:1}}",
    "#tsi-splash .write{transform-box:view-box;transform-origin:30px 0;transform:scaleX(0);animation:tsiWrite .8s 2.2s cubic-bezier(.4,0,.2,1) forwards}",
    "@keyframes tsiWrite{to{transform:scaleX(1)}}",
    "#tsi-splash .late{opacity:0;animation:tsiFade .5s 2.8s ease-out forwards}",
    "#tsi-splash .late2{opacity:0;animation:tsiFade .5s 3s ease-out forwards}",
    "#tsi-splash .bar{animation:tsiLoad 1.1s ease-in-out infinite}",
    "@keyframes tsiLoad{0%{transform:translateX(-60px)}100%{transform:translateX(160px)}}",
    "@media (prefers-reduced-motion:reduce){#tsi-splash *{animation-duration:1ms!important;animation-delay:0s!important}}"
  ].join("");
  var style = d.createElement("style");
  style.id = "tsi-splash-style";
  style.appendChild(d.createTextNode(css));
  (d.head || d.documentElement).appendChild(style);
  d.documentElement.classList.add("tsi-splashing");

  var svg = '' +
  '<svg viewBox="0 0 360 640" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' +
  '<defs>' +
    '<radialGradient id="tsiMoon" cx="42%" cy="40%" r="62%"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#fff6c8"/><stop offset=".75" stop-color="#ffd54a"/><stop offset="1" stop-color="#ffb21e"/></radialGradient>' +
    '<radialGradient id="tsiHalo" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff8d0" stop-opacity=".95"/><stop offset=".35" stop-color="#ffe9a0" stop-opacity=".45"/><stop offset="1" stop-color="#ffe9a0" stop-opacity="0"/></radialGradient><linearGradient id="tsiRay" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8" stop-opacity=".0"/><stop offset=".25" stop-color="#fff6c8" stop-opacity=".55"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></linearGradient><radialGradient id="tsiCloud" cx="50%" cy="35%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3f0fb"/></radialGradient>' +
    '<linearGradient id="tsiGlass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".38"/><stop offset=".5" stop-color="#bcd6ff" stop-opacity=".16"/><stop offset="1" stop-color="#fff" stop-opacity=".28"/></linearGradient>' +
    '<linearGradient id="tsiEdge" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".95"/><stop offset="1" stop-color="#c9dcff" stop-opacity=".55"/></linearGradient>' +
    '<linearGradient id="tsiBeam" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3b0" stop-opacity=".5"/><stop offset="1" stop-color="#fffdf2" stop-opacity="1"/></linearGradient>' +
    '<linearGradient id="tsiDown" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
    '<linearGradient id="tsiRb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#e53935"/><stop offset=".17" stop-color="#f57c00"/><stop offset=".34" stop-color="#f2b705"/><stop offset=".5" stop-color="#2e9e4f"/><stop offset=".67" stop-color="#1e7fe0"/><stop offset=".84" stop-color="#3b3fc4"/><stop offset="1" stop-color="#8e24aa"/></linearGradient>' +
    '<linearGradient id="tsiGold" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8a5d17"/><stop offset=".5" stop-color="#d9a634"/><stop offset="1" stop-color="#8a5d17"/></linearGradient>' +
    '<mask id="tsiFadeDown"><rect x="0" y="310" width="360" height="90" fill="url(#tsiDown)"/></mask>' +
    '<clipPath id="tsiBarClip"><rect x="120" y="596" width="120" height="3" rx="1.5"/></clipPath>' +
    '<filter id="tsiB3"><feGaussianBlur stdDeviation="3"/></filter><filter id="tsiB8"><feGaussianBlur stdDeviation="8"/></filter>' +
  '</defs>' +
  '<g class="cloud"><g opacity=".92" fill="url(#tsiCloud)"><ellipse cx="262" cy="104" rx="46" ry="15"/><circle cx="246" cy="96" r="17"/><circle cx="270" cy="88" r="22"/><circle cx="292" cy="99" r="14"/></g></g>' +
  '<g class="cloud c2"><g opacity=".8" fill="url(#tsiCloud)"><ellipse cx="300" cy="236" rx="38" ry="12"/><circle cx="288" cy="229" r="13"/><circle cx="306" cy="222" r="17"/><circle cx="322" cy="232" r="10"/></g></g>' +
  '<g class="cloud"><g opacity=".7" fill="url(#tsiCloud)"><ellipse cx="44" cy="300" rx="34" ry="10"/><circle cx="36" cy="294" r="11"/><circle cx="52" cy="288" r="14"/></g></g>' +
  '<g class="moon">' +
    '<circle class="halo" cx="82" cy="150" r="96" fill="url(#tsiHalo)"/>' +
    '<g class="rays">' + (function () { var o = ""; for (var i = 0; i < 16; i++) { var a = i * 22.5; o += '<polygon points="79,104 85,104 82,46" fill="url(#tsiRay)" transform="rotate(' + a + ' 82 150)" opacity="' + (i % 2 ? .55 : 1) + '"/>'; } return o; })() + '</g>' +
    '<circle cx="82" cy="150" r="34" fill="#fff3b0" opacity=".55"/>' +
    '<circle cx="82" cy="150" r="29" fill="url(#tsiMoon)"/>' +
  '</g>' +
  '<line class="beamGlow" x1="104" y1="172" x2="157" y2="266" stroke="#fff3b0" stroke-opacity=".6" stroke-width="12" filter="url(#tsiB8)"/>' +
  '<line class="beam" x1="104" y1="172" x2="157" y2="266" stroke="url(#tsiBeam)" stroke-width="2.6" stroke-linecap="round"/>' +
  '<g class="fan"><g mask="url(#tsiFadeDown)" opacity=".95">' +
    (function () {
      var cols = ["#ff4d4d", "#ff9a3c", "#ffe14d", "#4cd964", "#3fa9ff", "#5a5cff", "#b05cff"], out = "";
      for (var i = 0; i < 7; i++) {
        var t1 = 166 + i * 4, t2 = t1 + 4, b1 = 30 + i * 300 / 7, b2 = 30 + (i + 1) * 300 / 7;
        out += '<polygon points="' + t1 + ',316 ' + t2 + ',316 ' + b2.toFixed(1) + ',400 ' + b1.toFixed(1) + ',400" fill="' + cols[i] + '"/>';
      }
      return out;
    })() +
  '</g></g>' +
  '<g class="prism">' +
    '<polygon points="180,212 120,316 240,316" fill="url(#tsiGlass)"/>' +
    '<polygon class="flash" points="180,212 120,316 240,316" fill="#fff" filter="url(#tsiB3)"/>' +
    '<polygon points="180,212 120,316 240,316" fill="none" stroke="url(#tsiEdge)" stroke-width="2.4" stroke-linejoin="round"/><polygon points="180,212 120,316 240,316" fill="none" stroke="#0b3b7a" stroke-opacity=".18" stroke-width="5" stroke-linejoin="round" transform="translate(0 2)"/>' +
    '<line x1="180" y1="218" x2="180" y2="312" stroke="#fff" stroke-opacity=".25" stroke-width="1"/>' +
    '<line class="inner" x1="157" y1="266" x2="180" y2="314" stroke="#fff" stroke-opacity=".85" stroke-width="2"/>' +
  '</g>' +
  '<g class="write"><text x="180" y="440" text-anchor="middle" textLength="300" lengthAdjust="spacingAndGlyphs" ' +
    'font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-weight="800" font-size="46" fill="url(#tsiRb)" stroke="#ffffff" stroke-width="1.2" paint-order="stroke">SPECTRUM</text></g>' +
  '<text class="late" x="180" y="474" text-anchor="middle" textLength="250" lengthAdjust="spacing" ' +
    'font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="11" font-weight="600" fill="#1d3b6a">THE SPECTRUM INSTITUTE</text>' +
  '<g class="late2">' +
    '<text x="180" y="548" text-anchor="middle" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="8.5" fill="#5b6f8f" textLength="96" lengthAdjust="spacing">DEVELOPED BY</text>' +
    '<text x="180" y="568" text-anchor="middle" font-family="Segoe UI, Roboto, Helvetica, Arial, sans-serif" font-size="15" font-weight="800" fill="url(#tsiGold)" textLength="186" lengthAdjust="spacing">NETAFORD COMPANY</text>' +
  '</g>' +
  '<rect x="120" y="596" width="120" height="3" rx="1.5" fill="#0b3b7a" fill-opacity=".12"/>' +
  '<g clip-path="url(#tsiBarClip)"><rect class="bar" x="120" y="596" width="48" height="3" rx="1.5" fill="url(#tsiRb)"/></g>' +
  '</svg>';

  function mount() {
    if (d.getElementById("tsi-splash")) return;
    var el = d.createElement("div");
    el.id = "tsi-splash";
    el.setAttribute("role", "presentation");
    el.innerHTML = svg;
    d.body.appendChild(el);
    var done = false;
    function finish() {
      if (done) return; done = true;
      el.classList.add("out");
      d.documentElement.classList.remove("tsi-splashing");
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); var s = d.getElementById("tsi-splash-style"); if (s) s.remove(); }, 500);
    }
    el.addEventListener("click", finish);
    setTimeout(finish, TOTAL);
  }
  if (d.body) mount(); else d.addEventListener("DOMContentLoaded", mount);
})();
