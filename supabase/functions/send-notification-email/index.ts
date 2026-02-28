import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface EmailRequest {
  to: string;
  subject: string;
  type: "test" | "high_consumption" | "new_user" | "system_issue";
  message: string;
  data?: Record<string, unknown>;
}

const getEmailTemplate = (type: string, message: string, data?: Record<string, unknown>) => {
  const headerColors: Record<string, string> = {
    test: "#3b82f6",
    high_consumption: "#f59e0b",
    new_user: "#22c55e",
    system_issue: "#ef4444",
  };

  const headerTitles: Record<string, string> = {
    test: "Test Notification",
    high_consumption: "High Consumption Alert",
    new_user: "New User Registration",
    system_issue: "System Issue Detected",
  };

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${headerColors[type] || "#3b82f6"}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${headerTitles[type] || "Notification"}</h1>
      </div>
      <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">${message}</p>
        ${data ? `<pre style="background: #e5e7eb; padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px;">${JSON.stringify(data, null, 2)}</pre>` : ""}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">This is an automated message from EcoVigil Energy Dashboard.</p>
      </div>
    </div>
  `;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, type, message, data }: EmailRequest = await req.json();

    if (!to || !subject || !type || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    const html = getEmailTemplate(type, message, data);

    if (!RESEND_API_KEY) {
      console.log("RESEND_API_KEY not configured - logging email instead");
      console.log(`Email: to=${to}, subject=${subject}, type=${type}`);
      return new Response(
        JSON.stringify({ success: true, message: "Email logged (no API key configured)", to, subject }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "EcoVigil <onboarding@resend.dev>",
        to: [to],
        subject: `[EcoVigil] ${subject}`,
        html,
      }),
    });

    const responseData = await res.json();

    if (!res.ok) {
      throw new Error(`Resend API error [${res.status}]: ${JSON.stringify(responseData)}`);
    }

    console.log("Email sent successfully:", responseData);

    return new Response(JSON.stringify({ success: true, data: responseData }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: unknown) {
    console.error("Error sending email:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
