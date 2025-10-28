import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { 
      subject, 
      content, 
      template = 'default',
      sendToAll = false,
      testEmail = null 
    } = await req.json();

    console.log('Sending newsletter:', { subject, template, sendToAll, testEmail });

    // Buscar assinantes
    let subscribers: { email: string }[] = [];
    
    if (testEmail) {
      subscribers = [{ email: testEmail }];
    } else if (sendToAll) {
      const { data, error } = await supabaseClient
        .from('newsletter_subscribers')
        .select('email')
        .eq('active', true)
        .eq('confirmed', true);

      if (error) {
        throw new Error(`Erro ao buscar assinantes: ${error.message}`);
      }
      
      subscribers = data || [];
    }

    if (subscribers.length === 0) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Nenhum assinante encontrado'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar configurações do site
    const { data: siteSettings } = await supabaseClient
      .from('site_settings')
      .select('key, value')
      .in('key', ['site_name', 'contact_email']);

    const siteName = siteSettings?.find(s => s.key === 'site_name')?.value || 'ITL Brasil';
    const fromEmail = siteSettings?.find(s => s.key === 'contact_email')?.value || 'noticias@itlbrasil.com';

    // Template HTML da newsletter
    const newsletterHTML = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
            .container { max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; }
            .header { background: #1e40af; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px 20px; line-height: 1.6; }
            .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #666; }
            .button { display: inline-block; background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; margin: 10px 0; }
            .unsubscribe { color: #666; font-size: 12px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>${siteName}</h1>
                <p>Newsletter - Análises Geopolíticas</p>
            </div>
            <div class="content">
                ${content}
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                    <p><strong>Continue lendo em nosso site:</strong></p>
                    <a href="https://itlbrasil.com" class="button">Visite ITL Brasil</a>
                </div>
            </div>
            <div class="footer">
                <p>Este email foi enviado por ${siteName}</p>
                <p class="unsubscribe">
                    <a href="{{unsubscribe_url}}">Cancelar inscrição</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;

    let sentCount = 0;
    let errors = [];

    // Enviar emails em lotes
    const batchSize = 50;
    for (let i = 0; i < subscribers.length; i += batchSize) {
      const batch = subscribers.slice(i, i + batchSize);
      
      try {
        const emailPromises = batch.map(async (subscriber) => {
          // Gerar link de cancelamento único
          const unsubscribeUrl = `https://itlbrasil.com/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
          const finalHTML = newsletterHTML.replace('{{unsubscribe_url}}', unsubscribeUrl);

          return await resend.emails.send({
            from: `${siteName} <${fromEmail}>`,
            to: [subscriber.email],
            subject: subject,
            html: finalHTML,
          });
        });

        const results = await Promise.allSettled(emailPromises);
        
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            sentCount++;
          } else {
            errors.push({
              email: batch[index].email,
              error: result.reason?.message || 'Erro desconhecido'
            });
          }
        });

        // Pequena pausa entre lotes
        if (i + batchSize < subscribers.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

      } catch (batchError) {
        console.error('Erro no lote:', batchError);
        errors.push({
          batch: i / batchSize + 1,
          error: batchError instanceof Error ? batchError.message : String(batchError)
        });
      }
    }

    console.log(`Newsletter enviada: ${sentCount} sucessos, ${errors.length} erros`);

    return new Response(JSON.stringify({
      success: true,
      sentCount,
      totalSubscribers: subscribers.length,
      errors: errors.length > 0 ? errors : undefined,
      message: `Newsletter enviada para ${sentCount} de ${subscribers.length} assinantes`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Erro na função de newsletter:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});