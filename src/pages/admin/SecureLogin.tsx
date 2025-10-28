import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { useTheme } from 'next-themes';
import { useSecureAuth } from '@/contexts/SecureAuthContext';
import { Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { useVPNSession } from '@/hooks/useVPNSession';
import { z } from 'zod';
import loginLogo from '@/assets/login.png';
import { TechBackground } from '@/components/ui/TechBackground';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { VPNToggle } from '@/components/vpn/VPNToggle';

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

const LoginContent: React.FC = () => {
  const { signIn, resetPassword, isAuthenticated, isLoading, user } = useSecureAuth();
  const location = useLocation();
  const { toast } = useToast();
  const { settings } = useSiteSettings();
  const { upgradeSession } = useVPNSession();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
  });

  // Reset password state
  const [resetEmail, setResetEmail] = useState('');

  // Debug logging
  React.useEffect(() => {
    console.log('[SecureLogin] State:', { isAuthenticated, isLoading, path: location.pathname });
  }, [isAuthenticated, isLoading, location.pathname]);

  // Redirect if authenticated
  if (isAuthenticated) {
    const from = location.state?.from?.pathname || '/admin/';
    console.log('[SecureLogin] User is authenticated, redirecting to:', from);
    return <Navigate to={from} replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = loginSchema.parse(loginData);
      setIsSubmitting(true);
      
      console.log('SecureLogin: Attempting login with:', { email: validatedData.email });

      const { error } = await signIn(validatedData.email, validatedData.password);
      
      if (error) {
        console.error('SecureLogin: Login error:', error);
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
      } else {
        console.log('SecureLogin: Login successful');
        
        // Upgrade VPN guest session to authenticated session
        if (user?.id) {
          await upgradeSession(user.id);
        }
      }
    } catch (error) {
      console.error('SecureLogin: Validation error:', error);
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

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail || !resetEmail.includes('@')) {
      toast({
        title: "Email inválido",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const { error } = await resetPassword(resetEmail);
    
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
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <TechBackground />
      
      {/* Switch de tema - canto superior direito */}
      <div className="absolute top-8 right-8 z-50">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-[420px] animate-fade-in">
        {/* Card com glassmorphism */}
        <div 
          className="relative rounded-[20px] p-10 backdrop-blur-[20px] border border-white/10"
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            boxShadow: '0 0 25px rgba(0, 194, 255, 0.3)',
          }}
        >
          {/* Logo com animação */}
          <div className="w-full max-w-[200px] mx-auto mb-8">
            <img 
              src={settings.login_logo_url || settings.logo_url || settings.site_logo || loginLogo}
              alt="ITL Brasil Logo"
              className="w-full h-auto object-contain animate-pulse-glow"
              onError={(e) => {
                e.currentTarget.src = loginLogo;
              }}
            />
          </div>

          {/* Título tecnológico */}
          <h1 
            className="text-[1.8rem] font-bold text-white dark:text-white text-center mb-2"
            style={{ 
              fontFamily: "'Orbitron', sans-serif",
              textShadow: '0 0 15px rgba(0, 194, 255, 0.5)'
            }}
          >
            Acesso Administrativo
          </h1>

          {/* Subtítulo */}
          <p 
            className="text-[#A0A0A0] text-center mb-8 text-sm"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            Entre com suas credenciais para acessar o painel
          </p>

          {/* Formulário */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email */}
            <div className="space-y-2">
              <label 
                htmlFor="login-email"
                className="text-white text-sm font-medium block"
                style={{ fontFamily: "'Exo 2', sans-serif" }}
              >
                E-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00C2FF]" />
                <input
                  id="login-email"
                  type="email"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="seu@email.com"
                  className="w-full h-12 pl-11 pr-4 rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#00C2FF] transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  required
                />
              </div>
            </div>

            {/* VPN Toggle */}
            <VPNToggle />

            {/* Senha */}
            <div className="space-y-2">
              <label 
                htmlFor="login-password"
                className="text-white text-sm font-medium block"
                style={{ fontFamily: "'Exo 2', sans-serif" }}
              >
                Senha
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#00C2FF]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full h-12 pl-11 pr-12 rounded-lg text-white placeholder:text-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-[#00C2FF] transition-all"
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                  }}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#00C2FF] hover:text-[#00A3D9] transition-colors"
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
              className="w-full h-12 rounded-lg font-semibold text-white transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(0,194,255,0.6)] active:scale-95"
              style={{
                background: 'linear-gradient(90deg, #00C2FF, #007BFF)',
                fontFamily: "'Exo 2', sans-serif",
              }}
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

            {/* Links */}
            <div className="flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const email = prompt('Digite seu email para redefinir a senha:');
                  if (email) {
                    setResetEmail(email);
                    handleResetPassword(new Event('submit') as any);
                  }
                }}
                className="text-[#00C2FF] text-sm font-medium transition-all group relative"
                style={{ fontFamily: "'Exo 2', sans-serif" }}
              >
                <span className="relative">
                  Esqueceu sua senha?
                  <span className="absolute bottom-0 left-0 h-[2px] bg-[#00C2FF] w-0 group-hover:w-full transition-all duration-300" />
                </span>
              </button>
            </div>
          </form>

          {/* Rodapé */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <p className="text-[#A0A0A0] text-xs text-center mb-2">
              Não tem uma conta? Entre em contato com um administrador.
            </p>
            <p className="text-[#A0A0A0] text-xs text-center">
              © ITL Brasil v5 – Todos os direitos reservados.
            </p>
          </div>
        </div>

        {/* Selo Illúmina OS */}
        <div className="absolute bottom-4 right-4">
          <p 
            className="text-[#A0A0A0] text-[10px] opacity-60"
            style={{ fontFamily: "'Exo 2', sans-serif" }}
          >
            Powered by <span className="text-[#00C2FF]">Illúmina OS</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export const SecureLogin: React.FC = () => {
  return (
    <NextThemesProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false}
      storageKey="itl-login-theme"
    >
      <LoginContent />
    </NextThemesProvider>
  );
};
