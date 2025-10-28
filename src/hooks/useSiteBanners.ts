import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SiteBanner {
  id: string;
  title?: string;
  image_url: string;
  link_url?: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useSiteBanners = () => {
  const [banners, setBanners] = useState<SiteBanner[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from('site_banners' as any)
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setBanners(data as unknown as SiteBanner[] || []);
    } catch (error) {
      console.error('Error fetching banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBanner = async (banner: Omit<SiteBanner, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('site_banners' as any)
        .insert([banner])
        .select();

      if (error) {
        console.error('Erro detalhado ao adicionar banner:', error);
        throw new Error(`Erro ao adicionar banner: ${error.message || 'Tabela site_banners pode não existir ou não tem permissões RLS corretas'}`);
      }
      await fetchBanners();
      return data[0];
    } catch (error: any) {
      console.error('Error adding banner:', error);
      throw new Error(error.message || 'Erro ao adicionar banner. Verifique se a tabela existe e as permissões estão corretas.');
    }
  };

  const updateBanner = async (id: string, updates: Partial<SiteBanner>) => {
    try {
      const { error } = await supabase
        .from('site_banners' as any)
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchBanners();
    } catch (error) {
      console.error('Error updating banner:', error);
      throw error;
    }
  };

  const deleteBanner = async (id: string) => {
    try {
      const { error } = await supabase
        .from('site_banners' as any)
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchBanners();
    } catch (error) {
      console.error('Error deleting banner:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  return {
    banners,
    loading,
    fetchBanners,
    addBanner,
    updateBanner,
    deleteBanner
  };
};