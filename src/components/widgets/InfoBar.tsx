import React from 'react';
import { FinancialWidget } from './FinancialWidget';
import { WeatherWidget } from './WeatherWidget';
import { Separator } from '@/components/ui/separator';

interface InfoBarProps {
  showFinancial?: boolean;
  showWeather?: boolean;
  className?: string;
}

export const InfoBar: React.FC<InfoBarProps> = ({ 
  showFinancial = true, 
  showWeather = true,
  className = "" 
}) => {
  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {showFinancial && <FinancialWidget />}
      
      {showFinancial && showWeather && (
        <Separator orientation="vertical" className="h-4" />
      )}
      
      {showWeather && <WeatherWidget />}
    </div>
  );
};