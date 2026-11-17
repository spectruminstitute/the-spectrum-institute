/* =====================================================================
   The Spectrum Institute — Admin live admission alerts
   - Bell with badge in the admin top bar + feed of latest admissions
   - Pop-up alert, sound and browser notification on every new admission
   - Supabase Realtime (instant) + 20 s polling fallback
   - "Since your last visit" count when the admin logs in
   Developed by Netaford Company
   ===================================================================== */
(function () {
    "use strict";

    const SEEN_KEY = "tsi_admin_leads_seen_at_v1";
    const SOUND_KEY = "tsi_admin_alert_sound_v1";
    const POLL_MS = 20000;
    const FEED_LIMIT = 15;

    const state = {
        started: false,
        client: null,
        channel: null,
        pollTimer: null,
        lastCheck: null,
        seenAt: null,
        known: new Set(),
        feed: [],
        unseen: 0,
        realtimeOk: false,
        baseTitle: document.title,
        audioCtx: null
    };

    /* ---------- helpers ---------- */
    function esc(value) {
        return String(value == null ? "" : value)
            .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
    }
    function readLS(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
    function writeLS(key, value) { try { localStorage.setItem(key, value); } catch (_) { /* ignore */ } }
    function soundOn() { return readLS(SOUND_KEY) !== "off"; }

    function timeAgo(iso) {
        const t = new Date(iso).getTime();
        if (!t) return "";
        const s = Math.max(0, Math.round((Date.now() - t) / 1000));
        if (s < 45) return "just now";
        const m = Math.round(s / 60);
        if (m < 60) return m + " min ago";
        const h = Math.round(m / 60);
        if (h < 24) return h + " hr ago";
        const d = Math.round(h / 24);
        return d + (d === 1 ? " day ago" : " days ago");
    }

    function courseOf(lead) {
        if (lead.course_interest) return lead.course_interest;
        try {
            if (typeof adminCache !== "undefined" && lead.course_id) {
                const c = (adminCache.courses || []).find((x) => x.id === lead.course_id);
                if (c) return c.name;
            }
        } catch (_) { /* ignore */ }
        return "Course not selected";
    }

    function isNewer(lead) {
        return state.seenAt && lead.created_at && new Date(lead.created_at) > new Date(state.seenAt);
    }

    /* ---------- UI: bell + feed ---------- */
    function buildBell() {
        if (document.getElementById("hudBellBtn")) return;
        const nav = document.getElementById("adminNavLinks");
        if (!nav) return;
        const li = document.createElement("li");
        li.className = "hud-bell-li";
        li.innerHTML =
            '<button type="button" class="hud-bell-btn" id="hudBellBtn" aria-label="New admissions" aria-expanded="false" aria-controls="hudFeed">' +
            '<svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10 21a2 2 0 0 0 4 0"></path></svg>' +
            '<span class="hud-bell-text">New Admissions</span>' +
            '<span class="hud-bell-badge" id="hudBellBadge" hidden>0</span></button>' +
            '<div class="hud-feed" id="hudFeed" role="region" aria-label="Latest admissions" hidden>' +
            '<div class="hud-feed-head"><span class="hud-feed-title">NEW ADMISSIONS</span>' +
            '<button type="button" class="hud-feed-link" id="hudMarkSeen">Mark all seen</button></div>' +
            '<ul class="hud-feed-list" id="hudFeedList"><li class="hud-feed-empty">Loading…</li></ul>' +
            '<div class="hud-feed-foot"><button type="button" class="hud-feed-link" id="hudOpenLeads">Open Inquiry Leads →</button>' +
            '<button type="button" class="hud-feed-link" id="hudSoundToggle"></button></div></div>';
        const tabsLi = nav.querySelector(".admin-nav-tabs");
        const logoutLi = nav.querySelector(".nav-logout-btn")?.closest("li");
        if (tabsLi && tabsLi.nextSibling) nav.insertBefore(li, tabsLi.nextSibling);
        else nav.insertBefore(li, logoutLi || null);

        const btn = li.querySelector("#hudBellBtn");
        const feed = li.querySelector("#hudFeed");
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            const open = feed.hidden;
            feed.hidden = !open;
            btn.setAttribute("aria-expanded", String(open));
            if (open) {
                renderFeed();
                askNotificationPermission();
                unlockAudio();
            }
        });
        document.addEventListener("click", (e) => {
            if (!feed.hidden && !li.contains(e.target)) {
                feed.hidden = true;
                btn.setAttribute("aria-expanded", "false");
            }
        });
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && !feed.hidden) {
                feed.hidden = true;
                btn.setAttribute("aria-expanded", "false");
                btn.focus();
            }
        });
        li.querySelector("#hudMarkSeen").addEventListener("click", markAllSeen);
        li.querySelector("#hudOpenLeads").addEventListener("click", () => {
            feed.hidden = true;
            openLeads();
        });
        const soundBtn = li.querySelector("#hudSoundToggle");
        const paintSound = () => { soundBtn.textContent = soundOn() ? "🔊 Sound on" : "🔇 Sound off"; };
        soundBtn.addEventListener("click", () => {
            writeLS(SOUND_KEY, soundOn() ? "off" : "on");
            paintSound();
            if (soundOn()) { unlockAudio(); beep(); }
        });
        paintSound();
    }

    function buildLivePill() {
        if (document.getElementById("hudLivePill")) return;
        const header = document.querySelector(".admin-dash-header > div");
        if (!header) return;
        const pill = document.createElement("span");
        pill.id = "hudLivePill";
        pill.className = "hud-live-pill is-offline";
        pill.textContent = "CONNECTING…";
        header.appendChild(pill);
    }

    function setLive(ok) {
        const pill = document.getElementById("hudLivePill");
        if (!pill) return;
        pill.classList.toggle("is-offline", !ok);
        pill.textContent = ok ? "LIVE · ADMISSION ALERTS ON" : "AUTO-CHECK EVERY 20 SEC";
    }

    function paintBadge() {
        const badge = document.getElementById("hudBellBadge");
        const btn = document.getElementById("hudBellBtn");
        if (badge) {
            badge.hidden = state.unseen <= 0;
            badge.textContent = state.unseen > 99 ? "99+" : String(state.unseen);
        }
        if (btn) {
            btn.classList.toggle("has-new", state.unseen > 0);
            btn.setAttribute("aria-label", state.unseen > 0 ? state.unseen + " new admissions" : "New admissions");
        }
        document.title = state.unseen > 0 ? "(" + state.unseen + ") New admission · " + state.baseTitle : state.baseTitle;
    }

    function renderFeed() {
        const list = document.getElementById("hudFeedList");
        if (!list) return;
        if (!state.feed.length) {
            list.innerHTML = '<li class="hud-feed-empty">No admissions yet.</li>';
            return;
        }
        list.innerHTML = state.feed.slice(0, FEED_LIMIT).map((lead) => {
            const fresh = isNewer(lead);
            const meta = [courseOf(lead), lead.phone].filter(Boolean).map(esc).join(" · ");
            return '<li class="hud-feed-item' + (fresh ? " is-new" : "") + '">' +
                '<span class="hud-feed-dot" aria-hidden="true"></span>' +
                '<div class="hud-feed-body"><span class="hud-feed-name">' + esc(lead.full_name || "New student") +
                (fresh ? ' <span style="color:#ffcf8a;font-size:12px;letter-spacing:2px">NEW</span>' : "") + "</span>" +
                '<span class="hud-feed-meta">' + meta + "</span>" +
                '<span class="hud-feed-time">' + esc(timeAgo(lead.created_at)) + "</span></div></li>";
        }).join("");
    }

    /* ---------- alert pop-up ---------- */
    function alertStack() {
        let stack = document.getElementById("hudAlertStack");
        if (!stack) {
            stack = document.createElement("div");
            stack.id = "hudAlertStack";
            stack.className = "hud-alert-stack";
            stack.setAttribute("role", "status");
            stack.setAttribute("aria-live", "polite");
            document.body.appendChild(stack);
        }
        return stack;
    }

    function closeAlert(card) {
        if (!card || card.classList.contains("is-leaving")) return;
        card.classList.add("is-leaving");
        setTimeout(() => card.remove(), 360);
    }

    function showAlert(lead) {
        const stack = alertStack();
        while (stack.children.length >= 3) stack.firstElementChild.remove();
        const card = document.createElement("div");
        card.className = "hud-alert";
        const meta = [courseOf(lead), lead.phone].filter(Boolean).map(esc).join(" · ");
        card.innerHTML =
            '<div class="hud-alert-kicker"><span></span>NEW ADMISSION RECEIVED</div>' +
            '<p class="hud-alert-name">' + esc(lead.full_name || "New student") + "</p>" +
            '<div class="hud-alert-meta">' + meta + "</div>" +
            '<div class="hud-alert-actions"><button type="button" class="hud-alert-view">VIEW</button>' +
            '<button type="button" class="hud-alert-dismiss">DISMISS</button></div>';
        card.querySelector(".hud-alert-view").addEventListener("click", () => { closeAlert(card); openLeads(); });
        card.querySelector(".hud-alert-dismiss").addEventListener("click", () => closeAlert(card));
        stack.appendChild(card);
        setTimeout(() => closeAlert(card), 15000);
    }

    function showSummaryAlert(count) {
        const stack = alertStack();
        const card = document.createElement("div");
        card.className = "hud-alert";
        card.innerHTML =
            '<div class="hud-alert-kicker"><span></span>WHILE YOU WERE AWAY</div>' +
            '<p class="hud-alert-name">' + count + (count === 1 ? " new admission" : " new admissions") + "</p>" +
            '<div class="hud-alert-meta">Received since your last visit.</div>' +
            '<div class="hud-alert-actions"><button type="button" class="hud-alert-view">VIEW</button>' +
            '<button type="button" class="hud-alert-dismiss">LATER</button></div>';
        card.querySelector(".hud-alert-view").addEventListener("click", () => { closeAlert(card); openLeads(); });
        card.querySelector(".hud-alert-dismiss").addEventListener("click", () => closeAlert(card));
        stack.appendChild(card);
        setTimeout(() => closeAlert(card), 20000);
    }

    /* ---------- sound + browser notification ---------- */
    function unlockAudio() {
        try {
            if (!state.audioCtx) {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                if (Ctx) state.audioCtx = new Ctx();
            }
            if (state.audioCtx && state.audioCtx.state === "suspended") state.audioCtx.resume();
        } catch (_) { /* ignore */ }
    }

    function beep() {
        if (!soundOn() || !state.audioCtx || state.audioCtx.state !== "running") return;
        try {
            const ctx = state.audioCtx;
            const now = ctx.currentTime;
            [880, 1320].forEach((freq, i) => {
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = "sine";
                osc.frequency.value = freq;
                gain.gain.setValueAtTime(0.0001, now + i * 0.16);
                gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.16 + 0.02);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.16 + 0.15);
                osc.connect(gain).connect(ctx.destination);
                osc.start(now + i * 0.16);
                osc.stop(now + i * 0.16 + 0.16);
            });
        } catch (_) { /* ignore */ }
    }

    function askNotificationPermission() {
        try {
            if ("Notification" in window && Notification.permission === "default") Notification.requestPermission();
        } catch (_) { /* ignore */ }
    }

    function browserNotify(lead) {
        try {
            if (!("Notification" in window) || Notification.permission !== "granted") return;
            if (document.visibilityState === "visible" && document.hasFocus()) return;
            const n = new Notification("New admission — The Spectrum Institute", {
                body: (lead.full_name || "New student") + " · " + courseOf(lead),
                icon: "/icons/tsi-icon-192.png",
                tag: "tsi-lead-" + lead.id
            });
            n.onclick = () => { window.focus(); openLeads(); n.close(); };
        } catch (_) { /* ignore */ }
    }

    /* ---------- actions ---------- */
    function openLeads() {
        if (typeof window.switchAdminTab === "function") window.switchAdminTab("leads");
        const panel = document.getElementById("adminPanelLeads");
        if (panel) panel.scrollIntoView({ behavior: "smooth", block: "start" });
        markAllSeen();
    }

    function markAllSeen() {
        const newest = state.feed.reduce((max, l) => (l.created_at && l.created_at > max ? l.created_at : max), state.seenAt || "");
        state.seenAt = newest || new Date().toISOString();
        writeLS(SEEN_KEY, state.seenAt);
        state.unseen = 0;
        paintBadge();
        renderFeed();
    }

    function mergeIntoAdminCache(lead) {
        try {
            if (typeof adminCache === "undefined" || !Array.isArray(adminCache.leads)) return;
            if (adminCache.leads.some((l) => l.id === lead.id)) return;
            adminCache.leads.unshift(lead);
            if (typeof renderAdminLeadsTable === "function") renderAdminLeadsTable();
        } catch (_) { /* ignore */ }
    }

    function handleNewLead(lead, { quiet = false } = {}) {
        if (!lead || !lead.id || state.known.has(lead.id)) return;
        state.known.add(lead.id);
        state.feed.unshift(lead);
        state.feed.sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
        state.feed = state.feed.slice(0, 50);
        if (isNewer(lead)) state.unseen += 1;
        paintBadge();
        renderFeed();
        mergeIntoAdminCache(lead);
        if (!quiet) {
            showAlert(lead);
            beep();
            browserNotify(lead);
        }
    }

    /* ---------- data ---------- */
    const COLS = "id, full_name, phone, email, course_id, course_interest, status, created_at";

    async function loadInitial() {
        const { data, error } = await state.client
            .from("leads").select(COLS)
            .order("created_at", { ascending: false })
            .limit(50);
        if (error) { console.warn("[AdminLive] initial load:", error.message); return; }
        const rows = data || [];
        rows.forEach((l) => state.known.add(l.id));
        state.feed = rows;
        state.lastCheck = rows[0]?.created_at || new Date().toISOString();

        if (!state.seenAt) {
            // First time on this device: start counting from now.
            state.seenAt = state.lastCheck;
            writeLS(SEEN_KEY, state.seenAt);
        }
        state.unseen = rows.filter(isNewer).length;
        paintBadge();
        renderFeed();
        if (state.unseen > 0) showSummaryAlert(state.unseen);
    }

    async function poll() {
        if (!state.client) return;
        try {
            const since = state.lastCheck || new Date(Date.now() - 60000).toISOString();
            const { data, error } = await state.client
                .from("leads").select(COLS)
                .gt("created_at", since)
                .order("created_at", { ascending: true })
                .limit(25);
            if (error) throw error;
            (data || []).forEach((lead) => {
                handleNewLead(lead);
                if (lead.created_at > (state.lastCheck || "")) state.lastCheck = lead.created_at;
            });
        } catch (err) {
            console.warn("[AdminLive] poll:", err && err.message ? err.message : err);
        }
        // feed times ("2 min ago") stay fresh
        const feed = document.getElementById("hudFeed");
        if (feed && !feed.hidden) renderFeed();
    }

    function subscribeRealtime() {
        try {
            if (typeof state.client.channel !== "function") return;
            state.channel = state.client
                .channel("tsi-admin-new-leads")
                .on("postgres_changes", { event: "INSERT", schema: "public", table: "leads" }, (payload) => {
                    const lead = payload && payload.new;
                    if (!lead) return;
                    if (lead.created_at && lead.created_at > (state.lastCheck || "")) state.lastCheck = lead.created_at;
                    handleNewLead(lead);
                })
                .subscribe((status) => {
                    state.realtimeOk = status === "SUBSCRIBED";
                    setLive(state.realtimeOk);
                });
        } catch (err) {
            console.warn("[AdminLive] realtime:", err);
            setLive(false);
        }
    }

    async function start() {
        if (state.started) return;
        const client = window.__tsiSupabase;
        if (!client) return;
        state.started = true;
        state.client = client;
        state.seenAt = readLS(SEEN_KEY);
        state.baseTitle = document.title.replace(/^\(\d+\) New admission · /, "");

        buildBell();
        buildLivePill();
        setLive(false);

        // Mark seen whenever the admin opens the Leads tab.
        if (typeof window.switchAdminTab === "function" && !window.switchAdminTab.__hudWrapped) {
            const original = window.switchAdminTab;
            const wrapped = function (tab) {
                const result = original.apply(this, arguments);
                if (tab === "leads") setTimeout(markAllSeen, 400);
                return result;
            };
            wrapped.__hudWrapped = true;
            window.switchAdminTab = wrapped;
        }

        document.addEventListener("pointerdown", unlockAudio, { once: true });
        document.addEventListener("keydown", unlockAudio, { once: true });

        await loadInitial();
        subscribeRealtime();
        state.pollTimer = setInterval(poll, POLL_MS);
        document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") poll(); });
    }

    function stop() {
        if (!state.started) return;
        state.started = false;
        clearInterval(state.pollTimer);
        try { if (state.channel && state.client) state.client.removeChannel(state.channel); } catch (_) { /* ignore */ }
        state.channel = null;
        state.unseen = 0;
        paintBadge();
    }

    // Start once the admin session is active (body.admin-session is set by app.js).
    function watchSession() {
        const check = () => {
            if (document.body.classList.contains("admin-session")) start();
            else stop();
        };
        new MutationObserver(check).observe(document.body, { attributes: true, attributeFilter: ["class"] });
        check();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", watchSession);
    else watchSession();
})();
