import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/contexts/SecureAuthContext';

interface LogActivityData {
  activity_type: string;
  activity_description: string;
  resource_type?: string;
  resource_id?: string;
  metadata?: Record<string, any>;
}

export const useActivityLogger = () => {
  const { user } = useSecureAuth();

  return useMutation({
    mutationFn: async (data: LogActivityData) => {
      const { error } = await supabase.functions.invoke('log-user-activity', {
        body: {
          user_id: user?.id,
          user_email: user?.email,
          ...data
        }
      });

      if (error) throw error;
      return true;
    }
  });
};
