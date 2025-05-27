
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  tuneId: string;
  userName?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, tuneId, userName }: NotificationRequest = await req.json();

    const emailResponse = await resend.emails.send({
      from: "AI Headshots <onboarding@resend.dev>",
      to: [email],
      subject: "🎉 Your AI Model is Ready!",
      html: `
        <h1>Great news${userName ? `, ${userName}` : ''}!</h1>
        <p>Your personalized AI model has finished training and is ready to create professional headshots.</p>
        <p><strong>Ready to generate your headshots?</strong></p>
        <p><a href="${Deno.env.get('SITE_URL') || 'http://localhost:3000'}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Create Your Headshots</a></p>
        <p>Your model ID: <code>${tuneId}</code></p>
        <p>Best regards,<br>The AI Headshots Team</p>
      `,
    });

    console.log("Training notification sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending training notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
