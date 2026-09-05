import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Reuses the same RESEND_API_KEY already configured for send-certificate-email.
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("CERT_FROM_EMAIL") || "certificates@spectruminstitute.pk";

// New secrets this function needs — set these once in Supabase:
// Dashboard → Edge Functions → notify-new-admission → Secrets
//   ADMIN_NOTIFY_EMAIL     e.g. admin@spectruminstitute.pk
//   ADMIN_NOTIFY_PHONE     e.g. +923001234567  (used for both SMS and WhatsApp)
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_FROM_NUMBER     your Twilio SMS-capable number, e.g. +1415XXXXXXX
//   TWILIO_WHATSAPP_FROM   your Twilio WhatsApp sender, e.g. whatsapp:+14155238886
const ADMIN_NOTIFY_EMAIL = Deno.env.get("ADMIN_NOTIFY_EMAIL");
const ADMIN_NOTIFY_PHONE = Deno.env.get("ADMIN_NOTIFY_PHONE");
const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
const TWILIO_FROM_NUMBER = Deno.env.get("TWILIO_FROM_NUMBER");
const TWILIO_WHATSAPP_FROM = Deno.env.get("TWILIO_WHATSAPP_FROM");

interface AdmissionPayload {
  fullName: string;
  fatherName?: string;
  phone: string;
  email?: string;
  courseInterest: string;
  shift?: string;
  guardianName?: string;
  guardianPhone?: string;
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Content-Type": "application/json",
  };
}

async function sendAdminEmail(a: AdmissionPayload) {
  if (!RESEND_API_KEY || !ADMIN_NOTIFY_EMAIL) return { skipped: true, reason: "email not configured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: FROM_EMAIL,
      to: [ADMIN_NOTIFY_EMAIL],
      subject: `New Admission Application — ${a.fullName}`,
      html: `
        <p><strong>New online admission application received.</strong></p>
        <p>
          Name: <strong>${a.fullName}</strong><br>
          Father's Name: ${a.fatherName || "N/A"}<br>
          Phone: ${a.phone}<br>
          Email: ${a.email || "N/A"}<br>
          Course Interest: <strong>${a.courseInterest}</strong><br>
          Shift: ${a.shift || "N/A"}<br>
          Guardian: ${a.guardianName || "N/A"} (${a.guardianPhone || "N/A"})
        </p>
        <p>Log in to the admin dashboard to review and follow up.</p>
        <p>— The Spectrum Institute<br>Barikot · Swat</p>
      `,
    }),
  });
  const result = await res.json();
  return { ok: res.ok, result };
}

async function sendTwilioMessage(to: string, from: string, body: string) {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !from || !to) {
    return { skipped: true, reason: "twilio not configured" };
  }
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
  const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
  const form = new URLSearchParams({ To: to, From: from, Body: body });

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  const result = await res.json();
  return { ok: res.ok, result };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders() });
  }

  try {
    const payload = (await req.json()) as AdmissionPayload;
    if (!payload.fullName || !payload.phone || !payload.courseInterest) {
      return new Response(JSON.stringify({ error: "Missing required admission fields." }), {
        status: 400,
        headers: corsHeaders(),
      });
    }

    const smsBody = `New TSI admission: ${payload.fullName} — ${payload.courseInterest}. Phone: ${payload.phone}. Check admin dashboard.`;

    // Fire all three channels in parallel. Each is independently best-effort —
    // one channel failing (e.g. Twilio not configured yet) must never block
    // the others or fail the whole request, since the student's application
    // is already saved before this function is even called.
    const [emailResult, smsResult, whatsappResult] = await Promise.allSettled([
      sendAdminEmail(payload),
      ADMIN_NOTIFY_PHONE && TWILIO_FROM_NUMBER
        ? sendTwilioMessage(ADMIN_NOTIFY_PHONE, TWILIO_FROM_NUMBER, smsBody)
        : Promise.resolve({ skipped: true, reason: "sms not configured" }),
      ADMIN_NOTIFY_PHONE && TWILIO_WHATSAPP_FROM
        ? sendTwilioMessage(`whatsapp:${ADMIN_NOTIFY_PHONE.replace(/^whatsapp:/, "")}`, TWILIO_WHATSAPP_FROM, smsBody)
        : Promise.resolve({ skipped: true, reason: "whatsapp not configured" }),
    ]);

    return new Response(
      JSON.stringify({
        success: true,
        email: emailResult.status === "fulfilled" ? emailResult.value : { error: String(emailResult.reason) },
        sms: smsResult.status === "fulfilled" ? smsResult.value : { error: String(smsResult.reason) },
        whatsapp: whatsappResult.status === "fulfilled" ? whatsappResult.value : { error: String(whatsappResult.reason) },
      }),
      { status: 200, headers: corsHeaders() }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error." }),
      { status: 500, headers: corsHeaders() }
    );
  }
});
