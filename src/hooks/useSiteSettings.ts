import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteSetting {
  id: string;
  key: string;
  value?: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings' as any)
        .select('*');

      if (error) throw error;
      
      const settingsMap = (data as unknown as SiteSetting[] || []).reduce((acc, setting) => {
        // Handle JSON objects - convert to string representation
        let value = setting.value || '';
        if (typeof value === 'object') {
          value = JSON.stringify(value);
        }
        acc[setting.key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      setSettings(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('site_settings' as any)
        .upsert(
          { key: key, value: value },
          { onConflict: 'key' }
        );

      if (error) throw error;
      
      setSettings(prev => ({
        ...prev,
        [key]: value
      }));
    } catch (error) {
      console.error('Error updating setting:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    fetchSettings,
    updateSetting
  };
};