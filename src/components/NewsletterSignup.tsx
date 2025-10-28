import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface NewsletterSignupProps {
  className?: string;
  placeholder?: string;
  buttonText?: string;
}

export const NewsletterSignup = ({ 
  className = "",
  placeholder = "Seu melhor e-mail",
  buttonText = "Assinar Agora"
}: NewsletterSignupProps) => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu endereço de email.",
        variant: "destructive",
      });
      return;
    }

    if (!validateEmail(email)) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um endereço de email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // First, try to insert the subscriber
      const { error: insertError } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            email: email.trim().toLowerCase(),
            preferences: { categories: ['geopolitica', 'economia'] },
            active: true,
            confirmed: false,
          }
        ]);

      if (insertError) {
        if (insertError.code === '23505') { // Unique constraint violation
          toast({
            title: "Email já cadastrado",
            description: "Este email já está inscrito na nossa newsletter.",
            variant: "destructive",
          });
          return;
        } else {
          throw insertError;
        }
      }

      // Then send confirmation email
      const { error: emailError } = await supabase.functions.invoke(
        'send-newsletter-confirmation',
        {
          body: { email: email.trim().toLowerCase() }
        }
      );

      if (emailError) {
        console.error('Email sending error:', emailError);
        toast({
          title: "Erro no envio do email",
          description: "Inscrição realizada, mas houve erro no envio do email de confirmação. Tente novamente.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Inscrição realizada!",
          description: "Verificue seu email para confirmar a inscrição na newsletter.",
        });
        setEmail("");
      }
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({
        title: "Erro na inscrição",
        description: "Ocorreu um erro ao processar sua inscrição. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col sm:flex-row gap-4 ${className}`}>
      <Input
        type="email"
        placeholder={placeholder}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="flex-1"
        disabled={isLoading}
        aria-label="Endereço de email para newsletter"
      />
      <Button 
        type="submit" 
        className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3"
        disabled={isLoading}
        aria-label="Inscrever-se na newsletter"
      >
        {isLoading ? "Processando..." : buttonText}
      </Button>
    </form>
  );
};