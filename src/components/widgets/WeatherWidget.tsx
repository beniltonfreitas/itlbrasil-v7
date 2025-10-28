import React from 'react';
import { Cloud, Sun, CloudRain, MapPin, Thermometer } from 'lucide-react';
import { useWeatherData } from '@/hooks/useWeatherData';
import { Skeleton } from '@/components/ui/skeleton';

export const WeatherWidget: React.FC = () => {
  const { data, loading } = useWeatherData();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-4 rounded-full" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (!data) return null;

  const getWeatherIcon = (iconCode: string) => {
    if (iconCode.includes('01')) return <Sun className="h-4 w-4 text-yellow-500" />;
    if (iconCode.includes('02') || iconCode.includes('03')) return <Cloud className="h-4 w-4 text-gray-500" />;
    if (iconCode.includes('09') || iconCode.includes('10')) return <CloudRain className="h-4 w-4 text-blue-500" />;
    return <Sun className="h-4 w-4 text-yellow-500" />;
  };

  return (
    <div className="flex items-center gap-3 text-sm">
      <div className="flex items-center gap-2">
        {getWeatherIcon(data.icon)}
        <span className="font-medium">{data.temperature}°C</span>
      </div>
      
      <div className="hidden sm:flex items-center gap-1 text-muted-foreground">
        <MapPin className="h-3 w-3" />
        <span className="text-xs">{data.city}</span>
      </div>
      
      <div className="hidden md:flex items-center gap-1 text-muted-foreground text-xs">
        <Thermometer className="h-3 w-3" />
        <span>Sensação {typeof data.feelsLike === 'number' ? data.feelsLike : 0}°C</span>
      </div>
    </div>
  );
};