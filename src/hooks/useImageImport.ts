import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSecureAuth } from "@/contexts/SecureAuthContext";

interface ImportResult {
  cachedUrl: string;
}

export function useImageImport() {
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const { user } = useSecureAuth();

  const validateImageUrl = (url: string): { valid: boolean; error?: string } => {
    // Must start with http or https
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return { valid: false, error: "URL deve começar com http:// ou https://" };
    }

    // Block data URIs
    if (url.startsWith("data:")) {
      return { valid: false, error: "URLs data: não são suportadas" };
    }

    // Block localhost and private IPs
    const blockedPatterns = [
      /^https?:\/\/localhost/i,
      /^https?:\/\/127\./,
      /^https?:\/\/10\./,
      /^https?:\/\/192\.168\./,
      /^https?:\/\/172\.(1[6-9]|2[0-9]|3[01])\./,
      /^https?:\/\/\[::1\]/,
    ];

    for (const pattern of blockedPatterns) {
      if (pattern.test(url)) {
        return { valid: false, error: "URLs locais/privadas não são permitidas" };
      }
    }

    return { valid: true };
  };

  const importFromUrl = async (imageUrl: string): Promise<string | null> => {
    // Validate URL
    const validation = validateImageUrl(imageUrl);
    if (!validation.valid) {
      toast({
        title: "URL inválida",
        description: validation.error,
        variant: "destructive",
      });
      return null;
    }

    // Check authentication
    if (!user) {
      toast({
        title: "Não autenticado",
        description: "Faça login para importar imagens.",
        variant: "destructive",
      });
      return null;
    }

    setIsImporting(true);

    try {
      console.log("📥 Importando imagem:", imageUrl);

      const { data, error } = await supabase.functions.invoke<ImportResult>("proxy-image", {
        body: { imageUrl },
      });

      if (error) {
        console.error("❌ Erro na função proxy-image:", error);
        throw new Error(error.message || "Erro ao importar imagem");
      }

      if (!data?.cachedUrl) {
        throw new Error("Resposta inválida do servidor");
      }

      console.log("✅ Imagem importada:", data.cachedUrl);

      toast({
        title: "Imagem importada",
        description: "A imagem foi salva no armazenamento do site.",
      });

      return data.cachedUrl;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      console.error("❌ Erro ao importar imagem:", errorMessage);
      
      toast({
        title: "Erro ao importar",
        description: errorMessage,
        variant: "destructive",
      });
      
      return null;
    } finally {
      setIsImporting(false);
    }
  };

  return {
    importFromUrl,
    isImporting,
    validateImageUrl,
  };
}
