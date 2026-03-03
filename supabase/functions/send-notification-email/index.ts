import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const VALID_TYPES = ["test", "high_consumption", "new_user", "system_issue"] as const;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 255;
}

function sanitizeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
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

  const safeMessage = sanitizeHtml(message);

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: ${headerColors[type] || "#3b82f6"}; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">${headerTitles[type] || "Notification"}</h1>
      </div>
      <div style="background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
        <p style="color: #374151; font-size: 16px; line-height: 1.6;">${safeMessage}</p>
        ${data ? `<pre style="background: #e5e7eb; padding: 10px; border-radius: 4px; overflow: auto; font-size: 12px;">${sanitizeHtml(JSON.stringify(data, null, 2))}</pre>` : ""}
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
    // --- Authentication: require valid JWT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(
        JSON.stringify({ error: "Invalid token" }),
        { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const userId = claimsData.claims.sub;

    // --- Authorization: require admin role ---
    const { data: roleData, error: roleError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single();

    if (roleError || roleData?.role !== "admin") {
      return new Response(
        JSON.stringify({ error: "Forbidden - Admin access required" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // --- Input Validation ---
    const body = await req.json();
    const { to, subject, type, message, data } = body;

    if (!to || typeof to !== "string" || !isValidEmail(to)) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing 'to' email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!subject || typeof subject !== "string" || subject.length > 255) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing 'subject' (max 255 chars)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!type || !VALID_TYPES.includes(type)) {
      return new Response(
        JSON.stringify({ error: `Invalid 'type'. Must be one of: ${VALID_TYPES.join(", ")}` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!message || typeof message !== "string" || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "Invalid or missing 'message' (max 5000 chars)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const html = getEmailTemplate(type, message, data);

    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

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
    return new Response(
      JSON.stringify({ error: "An internal error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});
