import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const FROM_EMAIL = Deno.env.get("CERT_FROM_EMAIL") || "certificates@spectruminstitute.pk";

interface EmailPayload {
  to: string;
  studentName: string;
  fatherName?: string;
  certificateId: string;
  courseName: string;
  pdfBase64: string;
  filename?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
      },
    });
  }

  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "RESEND_API_KEY is not configured." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const payload = (await req.json()) as EmailPayload;
    const { to, studentName, fatherName, certificateId, courseName, pdfBase64, filename } = payload;

    if (!to || !studentName || !certificateId || !courseName || !pdfBase64) {
      return new Response(JSON.stringify({ error: "Missing required email fields." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject: `Your Certificate — ${certificateId}`,
        html: `
          <p>Dear <strong>${studentName}</strong>,</p>
          <p>Congratulations on completing <strong>${courseName}</strong> at The Spectrum Institute.</p>
          <p>Certificate ID: <strong>${certificateId}</strong>${fatherName ? `<br>Father's Name: <strong>${fatherName}</strong>` : ""}</p>
          <p>Your official certificate is attached as a PDF. You can verify it anytime on our website.</p>
          <p>— The Spectrum Institute<br>Barikot · Swat</p>
        `,
        attachments: [
          {
            filename: filename || `${certificateId}.pdf`,
            content: pdfBase64,
          },
        ],
      }),
    });

    const result = await resendResponse.json();
    if (!resendResponse.ok) {
      return new Response(JSON.stringify({ error: result?.message || "Resend API error." }), {
        status: resendResponse.status,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unexpected error." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
