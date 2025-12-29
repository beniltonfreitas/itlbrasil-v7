import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSecureAuth } from '@/contexts/SecureAuthContext';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const SecureLogin: React.FC = () => {
  const { signIn, resetPassword, isAuthenticated, isLoading } = useSecureAuth();
  const location = useLocation();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Reset password state
  const [resetEmail, setResetEmail] = useState('');

  // Redirect if authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/admin/';
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = loginSchema.parse(loginData);
      setIsSubmitting(true);

      const { error } = await signIn(validatedData.email, validatedData.password);
      
      if (error) {
        let errorMessage = error.message;
        if (error.message.includes("Invalid login credentials")) {
          errorMessage = "Email ou senha incorretos. Verifique suas credenciais.";
        } else if (error.message.includes("Email not confirmed")) {
          errorMessage = "Email não confirmado. Verifique sua caixa de entrada.";
        }
        toast({
          title: "Erro no login",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Dados inválidos",
          description: error.errors[0]?.message,
          variant: "destructive",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    const email = prompt('Digite seu email para redefinir a senha:');
    if (!email || !email.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await resetPassword(email);
    
    if (error) {
      toast({
        title: "Erro ao enviar email",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Lado Esquerdo - Branding (só desktop) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary/80 items-center justify-center p-12">
        <div className="text-center space-y-8 max-w-md animate-fade-in">
          <img 
            src="https://itlbrasil.com/assets/logo-itl-brasil-CE1kkbvC.png"
            alt="ITL Brasil"
            className="w-72 h-auto mx-auto drop-shadow-lg"
          />
          <div className="space-y-4">
            <h2 className="text-white text-3xl font-bold">
              ITL Brasil
            </h2>
            <p className="text-white/80 text-lg">
              Instituto de Tecnologia em Logística
            </p>
            <p className="text-white/60 text-sm">
              Transformando a logística brasileira através da inovação e tecnologia
            </p>
          </div>
        </div>
      </div>

      {/* Lado Direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md animate-fade-in">
          {/* Logo mobile */}
          <div className="lg:hidden mb-8">
            <img 
              src="https://itlbrasil.com/assets/logo-itl-brasil-CE1kkbvC.png"
              alt="ITL Brasil"
              className="w-40 mx-auto"
            />
          </div>

          {/* Título institucional */}
          <h1 className="text-2xl font-semibold text-primary text-center lg:text-left mb-2">
            Acesso Administrativo
          </h1>

          {/* Subtítulo discreto */}
          <p className="text-muted-foreground text-center lg:text-left mb-8 text-sm">
            Entre com suas credenciais para continuar
          </p>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div className="space-y-2">
              <label 
                htmlFor="login-email"
                className="text-sm font-medium text-foreground block"
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <input
                  id="login-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full h-12 pl-11 pr-4 rounded-lg bg-gray-50 border border-gray-200 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <label 
                htmlFor="login-password"
                className="text-sm font-medium text-foreground block"
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-12 rounded-lg bg-gray-50 border border-gray-200 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="w-full h-12 rounded-lg font-semibold text-white bg-primary hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting || isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isLoading ? 'Carregando...' : 'Entrando...'}
                </span>
              ) : (
                'Entrar'
              )}
            </button>

            {/* Link esqueceu senha */}
            <div className="flex justify-center lg:justify-start">
              <button
                type="button"
                onClick={handleResetPassword}
                className="text-primary text-sm font-medium hover:underline transition-all"
              >
                Esqueceu sua senha?
              </button>
            </div>
          </form>

          {/* Rodapé */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-muted-foreground text-xs text-center lg:text-left mb-2">
              Não tem uma conta? Entre em contato com um administrador.
            </p>
            <p className="text-muted-foreground text-xs text-center lg:text-left">
              © ITL Brasil – Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
