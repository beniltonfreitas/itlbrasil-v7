import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface NewsletterConfirmationRequest {
  email: string;
  token?: string;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  console.log('Newsletter confirmation request received');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (req.method === "POST") {
      // Send confirmation email
      const { email }: NewsletterConfirmationRequest = await req.json();
      console.log('Sending confirmation email to:', email);

      if (!email) {
        throw new Error('Email is required');
      }

      // Generate confirmation token
      const confirmationToken = crypto.randomUUID();

      // Update the subscriber with confirmation token
      const { error: updateError } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          confirmation_token: confirmationToken,
          confirmed: false 
        })
        .eq('email', email);

      if (updateError) {
        console.error('Error updating subscriber:', updateError);
        throw updateError;
      }

      // Send confirmation email
      const confirmationUrl = `https://kzbseckjublnjrxzktux.supabase.co/functions/v1/send-newsletter-confirmation?token=${confirmationToken}&email=${encodeURIComponent(email)}`;

      const emailResponse = await resend.emails.send({
        from: "GeoPolitica Brasil <newsletter@geopoliticabrasil.com>",
        to: [email],
        subject: "Confirme sua inscrição na newsletter",
        html: `
          <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
            <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 40px 20px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">GeoPolitica Brasil</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Análises geopolíticas aprofundadas</p>
            </div>
            
            <div style="padding: 40px 20px; background: white;">
              <h2 style="color: #1e40af; margin-bottom: 20px;">Confirme sua inscrição</h2>
              
              <p style="color: #374151; line-height: 1.6; margin-bottom: 30px;">
                Obrigado por se inscrever na nossa newsletter! Para completar sua inscrição e começar a receber 
                nossas análises geopolíticas exclusivas, clique no botão abaixo:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" 
                   style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; 
                          border-radius: 8px; font-weight: bold; display: inline-block;">
                  Confirmar Inscrição
                </a>
              </div>
              
              <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                Se você não se inscreveu na nossa newsletter, pode ignorar este email com segurança.
                <br><br>
                Este link expira em 24 horas por motivos de segurança.
              </p>
            </div>
            
            <div style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 12px;">
              <p>© 2024 GeoPolitica Brasil. Todos os direitos reservados.</p>
            </div>
          </div>
        `,
      });

      console.log("Confirmation email sent successfully:", emailResponse);

      return new Response(JSON.stringify({ 
        success: true, 
        message: "Email de confirmação enviado com sucesso!" 
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });

    } else if (req.method === "GET") {
      // Handle email confirmation
      const url = new URL(req.url);
      const token = url.searchParams.get('token');
      const email = url.searchParams.get('email');

      console.log('Processing confirmation for:', email, 'with token:', token);

      if (!token || !email) {
        return new Response(`
          <html>
            <head><title>Erro na Confirmação</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #ef4444;">Erro na Confirmação</h1>
              <p>Link de confirmação inválido.</p>
            </body>
          </html>
        `, {
          status: 400,
          headers: { 
            "Content-Type": "text/html",
            ...corsHeaders 
          }
        });
      }

      // Verify and confirm subscription
      const { data: subscriber, error: fetchError } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .eq('email', email)
        .eq('confirmation_token', token)
        .eq('confirmed', false)
        .single();

      if (fetchError || !subscriber) {
        console.error('Subscriber not found or already confirmed:', fetchError);
        return new Response(`
          <html>
            <head><title>Erro na Confirmação</title></head>
            <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
              <h1 style="color: #ef4444;">Erro na Confirmação</h1>
              <p>Link de confirmação inválido ou já utilizado.</p>
            </body>
          </html>
        `, {
          status: 400,
          headers: { 
            "Content-Type": "text/html",
            ...corsHeaders 
          }
        });
      }

      // Confirm subscription
      const { error: confirmError } = await supabase
        .from('newsletter_subscribers')
        .update({ 
          confirmed: true,
          confirmation_token: null 
        })
        .eq('email', email);

      if (confirmError) {
        console.error('Error confirming subscription:', confirmError);
        throw confirmError;
      }

      console.log('Subscription confirmed successfully for:', email);

      return new Response(`
        <html>
          <head>
            <title>Inscrição Confirmada</title>
            <style>
              body { font-family: Arial, sans-serif; background: #f9fafb; margin: 0; padding: 0; }
              .container { max-width: 600px; margin: 50px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              .header { background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 40px 20px; text-align: center; color: white; }
              .content { padding: 40px 20px; text-align: center; }
              .success-icon { font-size: 48px; color: #10b981; margin-bottom: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1 style="margin: 0; font-size: 28px;">GeoPolitica Brasil</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Análises geopolíticas aprofundadas</p>
              </div>
              <div class="content">
                <div class="success-icon">✅</div>
                <h2 style="color: #1e40af; margin-bottom: 20px;">Inscrição Confirmada!</h2>
                <p style="color: #374151; line-height: 1.6;">
                  Parabéns! Sua inscrição na newsletter da GeoPolitica Brasil foi confirmada com sucesso.
                  <br><br>
                  Você começará a receber nossas análises geopolíticas exclusivas em breve.
                </p>
              </div>
            </div>
          </body>
        </html>
      `, {
        status: 200,
        headers: { 
          "Content-Type": "text/html",
          ...corsHeaders 
        }
      });
    }

    return new Response('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error("Error in newsletter confirmation function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);