import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteAd {
  id: string;
  name: string;
  ad_type: 'home' | 'popup' | 'sky' | 'medium_rectangle' | 'super_banner_top' | 'super_banner_mobile';
  image_url: string;
  link_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const adTypes = [
  { key: 'home', label: 'Anúncio Home', dimensions: '728x900' },
  { key: 'popup', label: 'Anúncio Pop-UP', dimensions: '580x400' },
  { key: 'sky', label: 'Anúncio Céu', dimensions: '300x600' },
  { key: 'medium_rectangle', label: 'Retângulo Médio', dimensions: '300x250' },
  { key: 'super_banner_top', label: 'Super Banner Topo', dimensions: '970x250' },
  { key: 'super_banner_mobile', label: 'Super Banner (Mobile)', dimensions: '490x150' },
] as const;

export const useSiteAds = () => {
  const [ads, setAds] = useState<SiteAd[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAds = async () => {
    try {
      const { data, error } = await supabase
        .from('site_ads' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAds(data as unknown as SiteAd[] || []);
    } catch (error) {
      console.error('Error fetching ads:', error);
    } finally {
      setLoading(false);
    }
  };

  const addAd = async (ad: Omit<SiteAd, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('site_ads' as any)
        .insert([ad])
        .select();

      if (error) throw error;
      await fetchAds();
      return data[0];
    } catch (error) {
      console.error('Error adding ad:', error);
      throw error;
    }
  };

  const updateAd = async (id: string, updates: Partial<SiteAd>) => {
    try {
      const { error } = await supabase
        .from('site_ads' as any)
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchAds();
    } catch (error) {
      console.error('Error updating ad:', error);
      throw error;
    }
  };

  const deleteAd = async (id: string) => {
    try {
      const { error } = await supabase
        .from('site_ads' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchAds();
    } catch (error) {
      console.error('Error deleting ad:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchAds();
  }, []);

  return {
    ads,
    loading,
    fetchAds,
    addAd,
    updateAd,
    deleteAd
  };
};