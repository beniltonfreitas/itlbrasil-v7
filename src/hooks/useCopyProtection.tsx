import { useEffect } from "react";
import { toast } from "@/hooks/use-toast";

export const useCopyProtection = (enabled: boolean = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      
      const selection = window.getSelection()?.toString() || '';
      if (!selection) return;

      const credit = '\n\nFonte: ITL Brasil – https://itlbrasil.com';
      const textWithCredit = selection + credit;

      if (e.clipboardData) {
        e.clipboardData.setData('text/plain', textWithCredit);
      }

      toast({
        title: "⚠️ Conteúdo do ITL Brasil",
        description: (
          <>
            Cite a fonte:{" "}
            <a 
              href="https://itlbrasil.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary underline hover:text-primary/80"
            >
              itlbrasil.com
            </a>
          </>
        ),
        duration: 4000,
      });
    };

    document.addEventListener('copy', handleCopy);
    
    return () => {
      document.removeEventListener('copy', handleCopy);
    };
  }, [enabled]);
};
