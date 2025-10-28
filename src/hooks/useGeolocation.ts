import { useState, useEffect } from 'react';

interface GeolocationData {
  latitude: number;
  longitude: number;
  city?: string;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set default location immediately to prevent blocking
    const defaultLocation = {
      latitude: -23.5505,
      longitude: -46.6333,
      city: 'São Paulo'
    };
    
    setLocation(defaultLocation);
    setLoading(false);

    // Try to get user's location in background if available
    if (navigator.geolocation) {
      const timeoutId = setTimeout(() => {
        console.warn('Geolocation timeout, using default location');
      }, 5000);

      navigator.geolocation.getCurrentPosition(
        (position) => {
          clearTimeout(timeoutId);
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setError(null);
        },
        (err) => {
          clearTimeout(timeoutId);
          console.warn('Geolocation error (using default):', err);
          // Keep default location, don't show error to user
        },
        {
          timeout: 5000,
          enableHighAccuracy: false,
          maximumAge: 600000 // Cache for 10 minutes
        }
      );
    }
  }, []);

  return { location, loading, error };
};