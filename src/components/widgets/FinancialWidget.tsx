import React from 'react';
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, AlertCircle } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export const FinancialWidget: React.FC = () => {
  const { data, loading, refresh } = useFinancialData();

  if (loading) {
    return (
      <div className="flex items-center gap-4">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    );
  }

  if (!data) return null;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    });
  };

  const formatVariation = (variation: number) => {
    const isPositive = variation >= 0;
    return (
      <span className={`inline-flex items-center gap-1 text-xs ${
        isPositive ? 'text-green-600' : 'text-red-600'
      }`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {Math.abs(variation).toFixed(1)}%
      </span>
    );
  };

  const getTimeAgo = () => {
    if (!data?.lastUpdate) return '';
    const seconds = Math.floor((new Date().getTime() - data.lastUpdate.getTime()) / 1000);
    if (seconds < 60) return 'agora';
    const minutes = Math.floor(seconds / 60);
    return `${minutes}min atrás`;
  };

  return (
    <TooltipProvider>
      <div className="flex items-center gap-3 text-sm">
        {data.isStale && (
          <Tooltip>
            <TooltipTrigger>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </TooltipTrigger>
            <TooltipContent>
              <p>Dados podem estar desatualizados</p>
            </TooltipContent>
          </Tooltip>
        )}
        
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4" />
          <span className="hidden sm:inline">Dólar:</span>
          <span className="font-medium">R$ {formatCurrency(data.usd.value)}</span>
          {formatVariation(data.usd.variation)}
        </div>
        
        <div className="hidden md:flex items-center gap-2">
          <span>Euro:</span>
          <span className="font-medium">R$ {formatCurrency(data.eur.value)}</span>
          {formatVariation(data.eur.variation)}
        </div>
        
        <div className="hidden lg:flex items-center gap-2">
          <span>Bovespa:</span>
          <span className="font-medium">{data.bovespa.value.toLocaleString('pt-BR')}</span>
          {formatVariation(data.bovespa.variation)}
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Atualizado {getTimeAgo()}</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
};