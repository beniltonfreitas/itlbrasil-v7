import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/contexts/SecureAuthContext';

interface UserRole {
  id: string;
  user_id: string;
  role: 'superadmin' | 'admin' | 'editor' | 'author';
  created_at: string;
}

interface MenuPermission {
  menu_item: string;
  enabled: boolean;
}

export const useSecurePermissions = () => {
  const { user } = useSecureAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastFetch, setLastFetch] = useState<number>(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

  useEffect(() => {
    console.log('🔐 [useSecurePermissions] User changed:', user?.id, user?.email);
    if (user?.id) {
      fetchUserRoles();
    } else {
      console.log('⚠️ [useSecurePermissions] No user, clearing roles');
      setUserRoles([]);
      setLoading(false);
    }
  }, [user?.id]);

  const fetchUserRoles = async () => {
    if (!user?.id) return;

    // Cache: não buscar se já buscou recentemente
    const now = Date.now();
    if (now - lastFetch < CACHE_DURATION && userRoles.length > 0) {
      console.log('🔄 [useSecurePermissions] Using cached roles');
      return;
    }

    console.log('🔍 [useSecurePermissions] Fetching roles for user:', user.id, user.email);
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ [useSecurePermissions] Error fetching user roles:', error);
        return;
      }

      console.log('✅ [useSecurePermissions] Roles fetched:', data?.length || 0, 'roles found');
      console.log('📋 [useSecurePermissions] Roles details:', data);
      
      setUserRoles((data || []) as UserRole[]);
      setLastFetch(Date.now()); // Atualizar timestamp do cache
    } catch (error) {
      console.error('❌ [useSecurePermissions] Exception fetching user roles:', error);
    } finally {
      setLoading(false);
      console.log('🏁 [useSecurePermissions] Loading complete');
    }
  };

  const hasRole = (role: 'superadmin' | 'admin' | 'editor' | 'author') => {
    const result = userRoles.some(userRole => userRole.role === role);
    console.log(`🔑 [useSecurePermissions] hasRole("${role}"):`, result, '| Total roles:', userRoles.length);
    return result;
  };

  const isSuperAdmin = () => {
    return hasRole('superadmin');
  };

  const isAdmin = () => {
    return hasRole('admin') || hasRole('superadmin');
  };

  const hasAnyRole = (roles: ('superadmin' | 'admin' | 'editor' | 'author')[]) => {
    return roles.some(role => hasRole(role));
  };

  const getPrimaryRole = (): 'superadmin' | 'admin' | 'editor' | 'author' | null => {
    if (hasRole('superadmin')) return 'superadmin';
    if (hasRole('admin')) return 'admin';
    if (hasRole('editor')) return 'editor';
    if (hasRole('author')) return 'author';
    return null;
  };

  const canManageRoles = () => {
    return isSuperAdmin();
  };

  const canCreateAdmin = () => {
    return isSuperAdmin();
  };

  return {
    userRoles,
    loading,
    hasRole,
    isSuperAdmin,
    isAdmin,
    hasAnyRole,
    getPrimaryRole,
    canManageRoles,
    canCreateAdmin,
    refreshRoles: fetchUserRoles
  };
};