import { useState, useEffect } from 'react';

interface FinancialData {
  usd: {
    value: number;
    variation: number;
  };
  eur: {
    value: number;
    variation: number;
  };
  bovespa: {
    value: number;
    variation: number;
  };
  lastUpdate: Date;
  isStale: boolean;
}

export const useFinancialData = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBovespaData = async (signal: AbortSignal) => {
    // Try Brapi API first (Brazilian API with free tier)
    try {
      const response = await fetch(
        'https://brapi.dev/api/quote/IBOV?token=demo',
        { signal }
      );
      
      if (response.ok) {
        const data = await response.json();
        const quote = data?.results?.[0];
        if (quote?.regularMarketPrice) {
          return {
            value: Math.round(quote.regularMarketPrice),
            variation: parseFloat(quote.regularMarketChangePercent?.toFixed(2) || '0')
          };
        }
      }
    } catch (err) {
      console.warn('Brapi API failed:', err);
    }

    // Try Yahoo Finance API
    try {
      const response = await fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/%5EBVSP?interval=1d&range=1d',
        { signal }
      );
      
      if (response.ok) {
        const data = await response.json();
        const quote = data?.chart?.result?.[0]?.meta;
        if (quote?.regularMarketPrice) {
          return {
            value: Math.round(quote.regularMarketPrice),
            variation: parseFloat((((quote.regularMarketPrice - quote.previousClose) / quote.previousClose) * 100).toFixed(2))
          };
        }
      }
    } catch (err) {
      console.warn('Yahoo Finance API failed:', err);
    }

    // Fallback to Hgbrasil API
    try {
      const response = await fetch('https://api.hgbrasil.com/finance/stock_price?key=free&symbol=IBOV', { signal });
      if (response.ok) {
        const data = await response.json();
        if (data?.results?.IBOV) {
          const ibov = data.results.IBOV;
          return {
            value: Math.round(ibov.price),
            variation: parseFloat(ibov.change_percent?.toFixed(2) || '0')
          };
        }
      }
    } catch (err) {
      console.warn('HGBrasil API failed:', err);
    }

    return null;
  };

  const fetchFinancialData = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      setLoading(true);
      setError(null);

      const fallbackData = {
        usd: { value: 5.32, variation: 0.0 },
        eur: { value: 6.24, variation: 0.0 },
        bovespa: { value: 146237, variation: 0.0 }
      };

      let usdData = fallbackData.usd;
      let eurData = fallbackData.eur;
      let bovespaData = fallbackData.bovespa;
      let hasRealData = false;

      // Fetch currency data
      try {
        const currencyResponse = await fetch(
          'https://economia.awesomeapi.com.br/json/last/USD-BRL,EUR-BRL',
          { signal: controller.signal }
        );

        if (currencyResponse.ok) {
          const currencyResult = await currencyResponse.json();
          usdData = {
            value: parseFloat(currencyResult.USDBRL?.bid) || fallbackData.usd.value,
            variation: parseFloat(currencyResult.USDBRL?.pctChange) || fallbackData.usd.variation
          };
          eurData = {
            value: parseFloat(currencyResult.EURBRL?.bid) || fallbackData.eur.value,
            variation: parseFloat(currencyResult.EURBRL?.pctChange) || fallbackData.eur.variation
          };
          hasRealData = true;
        }
      } catch (err) {
        console.warn('Currency API error:', err);
      }

      // Fetch Bovespa data with fallback chain
      const bovespaResult = await fetchBovespaData(controller.signal);
      if (bovespaResult) {
        bovespaData = bovespaResult;
        hasRealData = true;
      } else {
        console.warn('All Bovespa APIs failed, using fallback data');
      }

      const financialData: FinancialData = {
        usd: usdData,
        eur: eurData,
        bovespa: bovespaData,
        lastUpdate: new Date(),
        isStale: !hasRealData
      };

      setData(financialData);
      setLoading(false);
    } catch (err) {
      console.error('Financial data fetch error:', err);
      setData({
        usd: { value: 5.32, variation: 0.0 },
        eur: { value: 6.24, variation: 0.0 },
        bovespa: { value: 146237, variation: 0.0 },
        lastUpdate: new Date(),
        isStale: true
      });
      setLoading(false);
    } finally {
      clearTimeout(timeoutId);
    }
  };

  useEffect(() => {
    fetchFinancialData();
    
    // Refresh every 30 seconds for real-time data
    const interval = setInterval(fetchFinancialData, 30 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return { data, loading, error, refresh: fetchFinancialData };
};