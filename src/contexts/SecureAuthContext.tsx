import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const SecureAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { toast } = useToast();
  const isInitialized = useRef(false);

  // useEffect principal - EXECUTA APENAS UMA VEZ
  useEffect(() => {
    // Prevenir dupla inicialização em React.StrictMode
    if (isInitialized.current) {
      console.log('SecureAuthContext: Already initialized, skipping');
      return;
    }
    
    isInitialized.current = true;
    console.log('SecureAuthContext: Initializing auth listener');

    // Safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      console.log('SecureAuthContext: Timeout reached, forcing loading to false');
      setIsLoading(false);
    }, 4000);

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('SecureAuthContext: Auth event:', event, 'Session:', !!session);
        
        // Atualizar estado (não durante logout manual)
        if (!isLoggingOut) {
          setSession(session);
          setUser(session?.user ?? null);
        }
        
        setIsLoading(false);
        clearTimeout(timeoutId);
        
        // Marcar login recente para mostrar toast
        if (event === 'SIGNED_IN') {
          console.log('SecureAuthContext: User signed in successfully');
          sessionStorage.setItem('recent_login', 'true');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!isLoggingOut) {
          setSession(session);
          setUser(session?.user ?? null);
        }
        setIsLoading(false);
        clearTimeout(timeoutId);
      })
      .catch((error) => {
        console.error('SecureAuthContext: Error getting session:', error);
        setIsLoading(false);
        clearTimeout(timeoutId);
      });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
      isInitialized.current = false;
    };
  }, []); // ✅ SEM DEPENDÊNCIAS - executar apenas uma vez

  // useEffect separado para toast de login
  useEffect(() => {
    if (session && !isLoading && !isLoggingOut) {
      const isRecentLogin = sessionStorage.getItem('recent_login');
      
      if (isRecentLogin === 'true') {
        toast({
          title: "Login realizado com sucesso",
          description: "Bem-vindo de volta!",
        });
        sessionStorage.removeItem('recent_login');
      }
    }
  }, [session, isLoading, isLoggingOut, toast]);

  // Public signup disabled - only admins can create users through admin panel
  const signUp = async (email: string, password: string, metadata?: any) => {
    console.error('Public signup is disabled. Users must be created by administrators.');
    return { 
      error: { 
        message: 'Cadastro público desabilitado. Entre em contato com um administrador para criar sua conta.' 
      } 
    };
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Email ou senha incorretos.' } };
        }
        if (error.message.includes('Email not confirmed')) {
          return { error: { message: 'Email não confirmado. Verifique sua caixa de entrada.' } };
        }
        return { error };
      }

      // Marcar login recente para mostrar toast
      sessionStorage.setItem('recent_login', 'true');

      // After successful login, auto-provision roles if needed
      if (data.user) {
        setTimeout(async () => {
          try {
            await supabase.functions.invoke('auto-provision-roles', {
              body: { 
                userId: data.user.id,
                email: data.user.email 
              }
            });
          } catch (roleError) {
            console.error('Error auto-provisioning roles:', roleError);
          }

          // Log login activity
          try {
            await supabase.functions.invoke('log-user-activity', {
              body: {
                user_id: data.user.id,
                user_email: data.user.email,
                activity_type: 'login',
                activity_description: 'Usuário fez login no sistema',
                metadata: { timestamp: new Date().toISOString() }
              }
            });
          } catch (logError) {
            console.error('Error logging activity:', logError);
          }
        }, 0);
      }

      return { error: null };
    } catch (error: any) {
      return { error: { message: 'Erro interno do servidor. Tente novamente.' } };
    }
  };

  const signOut = async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (isLoggingOut) {
      console.log('SecureAuthContext: Logout já em progresso, ignorando chamada duplicada');
      return;
    }
    
    setIsLoggingOut(true);
    
    try {
      const currentUser = user;
      console.log('SecureAuthContext: Iniciando processo de logout');
      
      // Limpar estado local PRIMEIRO (para prevenir re-renders problemáticos)
      setSession(null);
      setUser(null);
      
      // Tentar fazer logout no servidor
      const { error } = await supabase.auth.signOut();
      
      // Só mostrar erro se NÃO for "session_not_found" (que é esperado)
      if (error && !error.message.toLowerCase().includes('session')) {
        console.error('SecureAuthContext: Logout error (unexpected):', error);
        toast({
          title: "Aviso",
          description: "Você foi desconectado localmente.",
          variant: "default",
        });
      } else {
        console.log('SecureAuthContext: Logout concluído com sucesso');
        toast({
          title: "Logout realizado",
          description: "Você foi desconectado com segurança.",
        });
      }
      
      // Log logout activity (se ainda tiver usuário)
      if (currentUser) {
        setTimeout(() => {
          supabase.functions.invoke('log-user-activity', {
            body: {
              user_id: currentUser.id,
              user_email: currentUser.email,
              activity_type: 'logout',
              activity_description: 'Usuário fez logout do sistema',
              metadata: { timestamp: new Date().toISOString() }
            }
          }).catch(logError => {
            console.error('Error logging logout:', logError);
          });
        }, 0);
      }
      
      // Garantir limpeza completa do localStorage
      localStorage.removeItem('supabase.auth.token');
      
      // Pequeno delay para garantir que o toast seja exibido
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirecionar usando replace (mais limpo)
      window.location.replace('/auth');
      
    } catch (error: any) {
      console.error('SecureAuthContext: Erro inesperado no logout:', error);
      
      // Mesmo com erro, garantir limpeza e redirecionamento
      setSession(null);
      setUser(null);
      localStorage.removeItem('supabase.auth.token');
      
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado.",
      });
      
      window.location.replace('/auth');
    } finally {
      setIsLoggingOut(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const redirectUrl = `${window.location.origin}/auth`;
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        return { error };
      }

      toast({
        title: "Email enviado",
        description: "Verifique seu email para redefinir a senha.",
      });

      return { error: null };
    } catch (error: any) {
      return { error: { message: 'Erro interno do servidor. Tente novamente.' } };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    isAuthenticated: !!session,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useSecureAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useSecureAuth must be used within a SecureAuthProvider');
  }
  return context;
};