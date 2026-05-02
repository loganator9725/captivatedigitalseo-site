/**
 * React hook for Universal Predictive Protocol (UPP) Evaluator
 * Provides easy integration of UPP evaluation into React components
 */

import { useState, useCallback } from 'react';

interface MetricDataPoint {
  strategy: string;
  responseTimeMs: number;
  energyCost: number;
  timestamp?: string;
}

interface StrategyMetrics {
  strategy: string;
  avgResponseTime: number;
  avgEnergyCost: number;
  stddevResponseTime: number;
  stddevEnergyCost: number;
  sharpeRatioReward: number;
  sharpeRatioLatency: number;
  combinedScore: number;
  dataPoints: MetricDataPoint[];
}

interface EvaluationResult {
  summary: {
    avgResponseTime: number;
    avgEnergyCost: number;
    sharpeRatioReward: number;
    sharpeRatioLatency: number;
    combinedScore: number;
  };
  strategies: StrategyMetrics[];
  recommendation: string;
  timestamp: string;
}

interface UseUPPEvaluatorReturn {
  runEvaluation: (
    realData?: MetricDataPoint[] | null,
    iterations?: number
  ) => Promise<void>;
  isEvaluating: boolean;
  results: EvaluationResult | null;
  error: string | null;
}

/**
 * Hook for UPP evaluation
 * 
 * @returns Object with runEvaluation function, loading state, results, and error
 * 
 * @example
 * const { runEvaluation, isEvaluating, results, error } = useUPPEvaluator();
 * 
 * const handleEvaluate = async () => {
 *   await runEvaluation(); // Default: 1000 iterations
 *   // Or with custom iterations:
 *   await runEvaluation(null, 5000);
 *   // Or with real data:
 *   const data = [{ strategy: 'hybrid', responseTimeMs: 68, energyCost: 0.14 }];
 *   await runEvaluation(data);
 * };
 */
export function useUPPEvaluator(): UseUPPEvaluatorReturn {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [results, setResults] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const runEvaluation = useCallback(
    async (
      realData: MetricDataPoint[] | null = null,
      iterations: number = 1000
    ) => {
      setIsEvaluating(true);
      setError(null);

      try {
        // Determine Supabase URL from environment
        const supabaseUrl = process.env.REACT_APP_SUPABASE_URL ||
          process.env.VITE_SUPABASE_URL ||
          'https://msgxubftbqihdflusfsy.supabase.co';

        const response = await fetch(
          `${supabaseUrl}/functions/v1/upp-evaluator`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              iterations,
              data: realData,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            `UPP Evaluator error: ${response.status} ${response.statusText}`
          );
        }

        const data: EvaluationResult = await response.json();
        setResults(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
        console.error('[UPP Hook] Evaluation error:', errorMessage);
      } finally {
        setIsEvaluating(false);
      }
    },
    []
  );

  return {
    runEvaluation,
    isEvaluating,
    results,
    error,
  };
}

export default useUPPEvaluator;
