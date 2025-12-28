import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface ValidationResult {
  isValid: boolean;
  status: 'idle' | 'validating' | 'success' | 'error' | 'timeout';
  httpStatus?: number;
  responseTimeMs?: number;
  articlesFound?: number;
  lastArticleDate?: string;
  errorMessage?: string;
}

export const useFeedValidation = () => {
  const [validationResults, setValidationResults] = useState<Record<string, ValidationResult>>({});

  const validateFeed = async (feedUrl: string): Promise<ValidationResult> => {
    // Set validating state
    setValidationResults(prev => ({
      ...prev,
      [feedUrl]: { isValid: false, status: 'validating' }
    }));

    try {
      const { data, error } = await supabase.functions.invoke('test-rss-feed', {
        body: { 
          feedUrl,
          feedId: 'temp-validation'
        }
      });

      if (error) {
        const result: ValidationResult = {
          isValid: false,
          status: 'error',
          errorMessage: error.message
        };
        setValidationResults(prev => ({ ...prev, [feedUrl]: result }));
        return result;
      }

      const testResult = data?.results?.[0] || data;
      
      const result: ValidationResult = {
        isValid: testResult?.status === 'success',
        status: testResult?.status === 'success' ? 'success' : 'error',
        httpStatus: testResult?.httpStatus,
        responseTimeMs: testResult?.responseTimeMs,
        articlesFound: testResult?.articlesFound,
        lastArticleDate: testResult?.lastArticleDate,
        errorMessage: testResult?.errorMessage
      };

      setValidationResults(prev => ({ ...prev, [feedUrl]: result }));
      return result;
    } catch (err: any) {
      const result: ValidationResult = {
        isValid: false,
        status: 'error',
        errorMessage: err.message || 'Erro ao validar feed'
      };
      setValidationResults(prev => ({ ...prev, [feedUrl]: result }));
      return result;
    }
  };

  const getValidationResult = (feedUrl: string): ValidationResult | undefined => {
    return validationResults[feedUrl];
  };

  const clearValidation = (feedUrl: string) => {
    setValidationResults(prev => {
      const next = { ...prev };
      delete next[feedUrl];
      return next;
    });
  };

  return {
    validateFeed,
    getValidationResult,
    clearValidation,
    validationResults
  };
};
