import { useSiteSettings } from './useSiteSettings';
import { THEME_MODELS, getThemeById, getDefaultTheme } from '@/themes';

export const useThemeLoader = () => {
  const { settings, loading: isLoading } = useSiteSettings();
  
  // Safely parse theme config - check if it's already an object or needs parsing
  let themeConfig = { model: 'modelo-itl-05-v1' };
  try {
    const themeValue = settings['portal_theme'];
    if (themeValue) {
      // Check if already an object
      themeConfig = typeof themeValue === 'string' ? JSON.parse(themeValue) : themeValue;
    }
  } catch (error) {
    console.warn('Error parsing theme config, using default:', error);
  }
  
  const currentThemeId = themeConfig?.model || 'modelo-itl-05-v1';
  const currentTheme = getThemeById(currentThemeId) || getDefaultTheme();
  
  return {
    currentTheme,
    currentThemeId,
    isLoading,
    availableThemes: THEME_MODELS,
  };
};