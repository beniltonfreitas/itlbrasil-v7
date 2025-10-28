import { supabase } from "@/integrations/supabase/client";

export interface PublishToWhatsAppData {
  type: 'article' | 'webstory';
  title: string;
  summary: string;
  slug: string;
  image: string;
  tags?: string[];
  author: string;
  published_at: string;
}

export async function publishToWhatsApp(data: PublishToWhatsAppData): Promise<boolean> {
  try {
    const siteBaseUrl = import.meta.env.VITE_SITE_BASE_URL || 'https://itlbrasil.com';
    const whatsappChannel = import.meta.env.VITE_WHATSAPP_CHANNEL_URL || 'https://whatsapp.com/channel/0029Vb735uVIt5rscmQ3XA0Z';
    
    const url = `${siteBaseUrl}/${data.type === 'article' ? 'noticia' : 'webstory'}/${data.slug}`;
    
    const payload = {
      type: data.type,
      title: data.title,
      summary: data.summary,
      url,
      image: data.image,
      tags: data.tags || [],
      author: data.author,
      published_at: data.published_at,
      whatsapp_channel: whatsappChannel,
    };

    console.log('📱 Chamando Edge Function publish-to-whatsapp:', payload);

    const { data: result, error } = await supabase.functions.invoke('publish-to-whatsapp', {
      body: payload,
    });

    if (error) {
      console.error('❌ Erro ao chamar Edge Function:', error);
      return false;
    }

    console.log('✅ Resposta da Edge Function:', result);
    return result?.success || false;

  } catch (error) {
    console.error('❌ Erro ao publicar no WhatsApp:', error);
    return false;
  }
}
