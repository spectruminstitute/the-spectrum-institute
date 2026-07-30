/**
 * Admin auth guard + login for The Spectrum Institute portal.
 * Attach to admin/dashboard.html (guard) and admin/login.html (sign-in).
 */
(function () {
    "use strict";

    const SUPABASE_URL = "https://ngcbflylskwrtugxfzgu.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_Ybn6aXVh2xo9VvV7RvwllQ_gPMdYgGq";

    function assertPublicSupabaseKey(key) {
        const raw = String(key || "").trim();
        if (!raw) return false;
        if (/service_role|secret/i.test(raw)) {
            console.error("[Security] Refusing to init Supabase with a service_role/secret key in the browser.");
            return false;
        }
        return raw.startsWith("sb_publishable_") || raw.startsWith("eyJ") || raw.length > 20;
    }

    function getPageKind() {
        const path = String(window.location.pathname || "").replace(/\\/g, "/").toLowerCase();
        if (path.endsWith("login.html")) return "login";
        if (path.endsWith("dashboard.html")) return "dashboard";
        return "other";
    }

    function createClient() {
        if (window.__tsiSupabase) return window.__tsiSupabase;
        if (typeof supabase === "undefined" || !SUPABASE_URL.startsWith("http") || !assertPublicSupabaseKey(SUPABASE_ANON_KEY)) {
            return null;
        }
        const client = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        window.__tsiSupabase = client;
        return client;
    }

    function showLoginError(message) {
        const errorEl = document.getElementById("adminLoginError");
        if (!errorEl) return;
        errorEl.hidden = false;
        errorEl.textContent = message;
    }

    function setLoginLoading(isLoading) {
        const btn = document.getElementById("adminLoginSubmitBtn");
        if (!btn) return;
        btn.disabled = isLoading;
        btn.textContent = isLoading ? "Signing in…" : "Sign In Securely";
    }

    async function handleAdminLogout() {
        const client = createClient();
        try {
            if (client) await client.auth.signOut();
        } catch (err) {
            console.error("[Admin Auth] Logout error:", err);
        } finally {
            window.__tsiAdminUser = null;
            window.location.href = "login.html";
        }
    }

    async function handleLoginSubmit(event) {
        event.preventDefault();
        const client = createClient();
        if (!client) {
            showLoginError("Authentication service unavailable. Check your connection and try again.");
            return;
        }

        const email = document.getElementById("adminEmail")?.value.trim() || "";
        const password = document.getElementById("adminPassword")?.value || "";
        const errorEl = document.getElementById("adminLoginError");
        if (errorEl) {
            errorEl.hidden = true;
            errorEl.textContent = "";
        }

        if (!email || !password) {
            showLoginError("Email and password are required.");
            return;
        }

        setLoginLoading(true);
        try {
            const { data, error } = await client.auth.signInWithPassword({ email, password });
            if (error) {
                showLoginError(error.message || "Invalid credentials. Please try again.");
                return;
            }
            window.__tsiAdminUser = data.user || data.session?.user || null;
            window.location.href = "dashboard.html";
        } catch (err) {
            console.error("[Admin Auth] Login error:", err);
            showLoginError("Unexpected login failure. Check your connection and try again.");
        } finally {
            setLoginLoading(false);
        }
    }

    async function guardDashboard(client) {
        const { data, error } = await client.auth.getSession();
        if (error || !data?.session?.user) {
            window.location.href = "login.html";
            return;
        }

        window.__tsiAdminUser = data.session.user;
        document.body.classList.add("admin-session");
        document.body.classList.remove("auth-resolving");

        const emailLabel = document.getElementById("adminNavEmail");
        if (emailLabel) emailLabel.textContent = data.session.user.email || "Administrator";

        document.dispatchEvent(
            new CustomEvent("tsi:admin-ready", { detail: { user: data.session.user } })
        );
    }

    async function bootLogin(client) {
        document.body.classList.remove("auth-resolving");

        if (client) {
            try {
                const { data } = await client.auth.getSession();
                if (data?.session?.user) {
                    window.__tsiAdminUser = data.session.user;
                    window.location.href = "dashboard.html";
                    return;
                }
            } catch (err) {
                console.warn("[Admin Auth] Session check on login page failed:", err);
            }
        }

        const form = document.getElementById("adminLoginForm");
        if (form) form.addEventListener("submit", handleLoginSubmit);
    }

    async function boot() {
        const kind = getPageKind();
        const client = createClient();

        window.handleAdminLogout = handleAdminLogout;

        if (kind === "dashboard") {
            if (!client) {
                window.location.href = "login.html";
                return;
            }
            await guardDashboard(client);
            return;
        }

        if (kind === "login") {
            await bootLogin(client);
        }
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", boot);
    } else {
        boot();
    }
})();
