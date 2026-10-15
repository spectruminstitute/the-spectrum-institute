/* TSI Prospectus page: course search, department filter, section highlighting, print. */
(function () {
    "use strict";

    var search = document.getElementById("pspSearch");
    var chips = Array.prototype.slice.call(document.querySelectorAll(".psp-chip"));
    var cats = Array.prototype.slice.call(document.querySelectorAll(".psp-cat"));
    var empty = document.getElementById("pspEmpty");
    var activeFilter = "all";

    function norm(s) { return (s || "").toLowerCase().replace(/\s+/g, " ").trim(); }

    function applyFilters() {
        var q = norm(search ? search.value : "");
        var terms = q ? q.split(" ") : [];
        var anyVisible = false;

        cats.forEach(function (cat) {
            var catMatches = activeFilter === "all" || cat.getAttribute("data-cat") === activeFilter;
            var catHasRows = false;

            var groups = cat.querySelectorAll("[data-group]");
            var tables = groups.length ? groups : [cat];

            Array.prototype.forEach.call(tables, function (scope) {
                var scopeHasRows = false;
                Array.prototype.forEach.call(scope.querySelectorAll("tbody tr"), function (tr) {
                    var hay = tr.getAttribute("data-search") || "";
                    var ok = catMatches && terms.every(function (t) { return hay.indexOf(t) !== -1; });
                    tr.hidden = !ok;
                    if (ok) scopeHasRows = true;
                });
                if (scope !== cat) scope.hidden = !scopeHasRows;
                if (scopeHasRows) catHasRows = true;
            });

            // Keep the monthly-tuition note visible only with the full coaching list.
            var callout = cat.querySelector(".psp-callout");
            if (callout) callout.hidden = !!q;

            cat.hidden = !catHasRows;
            if (catHasRows) anyVisible = true;
        });

        if (empty) empty.hidden = anyVisible;
    }

    chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
            activeFilter = chip.getAttribute("data-filter");
            chips.forEach(function (c) {
                var on = c === chip;
                c.classList.toggle("is-active", on);
                c.setAttribute("aria-pressed", on ? "true" : "false");
            });
            applyFilters();
        });
    });

    if (search) {
        search.addEventListener("input", applyFilters);
        search.addEventListener("keydown", function (e) {
            if (e.key === "Escape") { search.value = ""; applyFilters(); }
        });
    }

    // Print: show every course regardless of the current filter.
    var printBtn = document.getElementById("pspPrint");
    if (printBtn) printBtn.addEventListener("click", function () { window.print(); });

    // Highlight the current section in the sticky section nav.
    var links = Array.prototype.slice.call(document.querySelectorAll(".psp-toc a"));
    if ("IntersectionObserver" in window && links.length) {
        var byId = {};
        links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                links.forEach(function (a) { a.classList.remove("is-active"); });
                var link = byId[entry.target.id];
                if (link) {
                    link.classList.add("is-active");
                    if (link.scrollIntoView && window.innerWidth < 700) {
                        link.parentNode.scrollTo({ left: link.offsetLeft - 16, behavior: "smooth" });
                    }
                }
            });
        }, { rootMargin: "-45% 0px -50% 0px" });
        Object.keys(byId).forEach(function (id) {
            var el = document.getElementById(id);
            if (el) observer.observe(el);
        });
    }
})();
