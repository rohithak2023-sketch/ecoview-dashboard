import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  type: "test" | "high_consumption" | "new_user" | "system_issue";
  message: string;
  data?: Record<string, unknown>;
}

const getEmailTemplate = (type: string, message: string, data?: Record<string, unknown>) => {
  const baseStyle = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  `;

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
    <div style="${baseStyle}">
      <div style="background: ${headerColors[type] || "#3b82f6"}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${headerTitles[type] || "Notification"}</h1>
      </div>
      <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">${message}</p>
        ${data ? `<pre style="background: #e5e7eb; padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px;">${JSON.stringify(data, null, 2)}</pre>` : ""}
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
        <p style="color: #6b7280; font-size: 12px;">
          This is an automated message from your Energy Dashboard.
        </p>
      </div>
    </div>
  `;
};

const handler = async (req: Request): Promise<Response> => {
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

    const html = getEmailTemplate(type, message, data);

    const emailResponse = await resend.emails.send({
      from: "Energy Dashboard <onboarding@resend.dev>",
      to: [to],
      subject: `[Energy Dashboard] ${subject}`,
      html,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
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
};

serve(handler);
