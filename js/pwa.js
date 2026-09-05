// The Spectrum Institute (TSI) - PWA install + service worker registration
(function () {
  "use strict";

  // 1. Register service worker
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () {
      navigator.serviceWorker.register("/service-worker.js").catch(function () {
        /* silent fail: PWA install can still work without SW in some browsers */
      });
    });
  }

  // 2. Capture Chrome/Edge/Android's install prompt and surface our own button
  //    so the "Install App" offer is visible right away instead of hiding in
  //    the browser's menu.
  var deferredPrompt = null;
  var installBtn = null;

  function createInstallButton() {
    if (document.getElementById("tsi-install-btn")) return;

    installBtn = document.createElement("button");
    installBtn.id = "tsi-install-btn";
    installBtn.type = "button";
    installBtn.innerText = "Install App";
    installBtn.setAttribute("aria-label", "Install The Spectrum Institute App");

    var style = document.createElement("style");
    style.innerHTML = [
      "#tsi-install-btn{",
      "position:fixed;right:18px;bottom:18px;z-index:99999;",
      "display:flex;align-items:center;gap:8px;",
      "background:#0c1836;color:#fff;border:1px solid rgba(255,255,255,0.15);",
      "padding:12px 18px;border-radius:999px;font-family:'Space Grotesk',sans-serif;",
      "font-size:14px;font-weight:600;letter-spacing:.2px;cursor:pointer;",
      "box-shadow:0 8px 24px rgba(0,0,0,0.35);transition:transform .15s ease,opacity .15s ease;",
      "}",
      "#tsi-install-btn:hover{transform:translateY(-2px);}",
      "#tsi-install-btn:before{content:'';width:18px;height:18px;border-radius:5px;",
      "background:image-set(url('/icons/icon-32.png') 1x) no-repeat center/cover;",
      "background:url('/icons/icon-32.png') no-repeat center/cover;flex:0 0 auto;}",
      "@media (max-width:480px){#tsi-install-btn{right:14px;bottom:14px;padding:11px 16px;font-size:13px;}}"
    ].join("");
    document.head.appendChild(style);

    installBtn.addEventListener("click", function () {
      if (!deferredPrompt) return;
      installBtn.style.display = "none";
      deferredPrompt.prompt();
      deferredPrompt.userChoice.finally(function () {
        deferredPrompt = null;
      });
    });

    document.body.appendChild(installBtn);
  }

  window.addEventListener("beforeinstallprompt", function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (document.body) {
      createInstallButton();
    } else {
      document.addEventListener("DOMContentLoaded", createInstallButton);
    }
  });

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    if (installBtn) installBtn.style.display = "none";
  });
})();
