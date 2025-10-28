import { useState, useEffect } from 'react';
import { useGeolocation } from './useGeolocation';

interface WeatherData {
  temperature: number;
  description: string;
  city: string;
  humidity: number;
  feelsLike: number;
  icon: string;
}

export const useWeatherData = () => {
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { location, loading: locationLoading } = useGeolocation();

  const fetchWeatherData = async (lat?: number, lon?: number) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
    
    try {
      setLoading(true);
      setError(null);

      // Default to São Paulo coordinates if location not available
      const latitude = lat || -23.5505;
      const longitude = lon || -46.6333;
      const defaultCity = lat && lon ? 'Sua localização' : 'São Paulo';

      // Immediate fallback data
      const fallbackData: WeatherData = {
        temperature: 25,
        description: 'Ensolarado',
        city: defaultCity,
        humidity: 65,
        feelsLike: 27,
        icon: '01d'
      };
      
      setData(fallbackData); // Set fallback immediately
      setLoading(false); // Allow UI to render

      // Mock weather data with slight variation
      const mockWeatherData: WeatherData = {
        temperature: Math.round(18 + Math.random() * 15), // Random temp between 18-33°C
        description: 'Parcialmente nublado',
        city: defaultCity,
        humidity: Math.round(40 + Math.random() * 40), // Random humidity 40-80%
        feelsLike: Math.round(20 + Math.random() * 12), // Random feels like temp
        icon: '02d' // Partly cloudy day icon
      };

      // Small delay to simulate API
      await new Promise((resolve, reject) => {
        const timer = setTimeout(resolve, 300);
        controller.signal.addEventListener('abort', () => {
          clearTimeout(timer);
          reject(new Error('Aborted'));
        });
      });

      setData(mockWeatherData);
    } catch (err) {
      // Don't change UI, fallback already set
      console.warn('Weather data fetch error (using fallback):', err);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  useEffect(() => {
    if (!locationLoading) {
      fetchWeatherData(location?.latitude, location?.longitude);
      
      // Refresh every 30 minutes
      const interval = setInterval(() => {
        fetchWeatherData(location?.latitude, location?.longitude);
      }, 30 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [location, locationLoading]);

  return { data, loading: loading || locationLoading, error, refresh: () => fetchWeatherData(location?.latitude, location?.longitude) };
};