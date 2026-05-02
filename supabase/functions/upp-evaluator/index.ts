/**
 * Universal Predictive Protocol (UPP) Evaluator
 * Backend edge function that evaluates optimization strategies through simulation
 * and calculates Sharpe ratios for performance/sustainability balance
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

/**
 * Generate simulated metrics for a strategy
 */
function generateMetrics(
  strategy: string,
  iterations: number
): MetricDataPoint[] {
  const metrics: MetricDataPoint[] = [];
  const baselineResponseTimes: Record<string, number> = {
    "cache-first": 45,
    "db-priority": 120,
    "edge-compute": 85,
    "hybrid": 70,
  };

  const baselineEnergyCosts: Record<string, number> = {
    "cache-first": 0.08,
    "db-priority": 0.20,
    "edge-compute": 0.12,
    "hybrid": 0.14,
  };

  const baselineResponse = baselineResponseTimes[strategy] || 100;
  const baselineEnergy = baselineEnergyCosts[strategy] || 0.15;

  for (let i = 0; i < iterations; i++) {
    // Simulate realistic variance in metrics
    const responseTimeVariance = (Math.random() - 0.5) * 30;
    const energyVariance = (Math.random() - 0.05) * 0.04;

    metrics.push({
      strategy,
      responseTimeMs: Math.max(
        10,
        baselineResponse + responseTimeVariance
      ),
      energyCost: Math.max(
        0.01,
        baselineEnergy + energyVariance
      ),
      timestamp: new Date().toISOString(),
    });
  }

  return metrics;
}

/**
 * Calculate mean of array
 */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Calculate standard deviation
 */
function stddev(values: number[]): number {
  if (values.length < 2) return 0;
  const avg = mean(values);
  const squareDiffs = values.map((val) => Math.pow(val - avg, 2));
  const avgSquareDiff = mean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

/**
 * Calculate Sharpe ratio
 * Sharpe Ratio = (Mean Return - Risk-free Rate) / Standard Deviation
 * In our case: Sharpe Ratio = Mean / StdDev (risk-free rate = 0)
 */
function calculateSharpeRatio(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = mean(values);
  const std = stddev(values);
  return std > 0 ? avg / std : 0;
}

/**
 * Evaluate a single strategy
 */
function evaluateStrategy(
  strategy: string,
  metricPoints: MetricDataPoint[]
): StrategyMetrics {
  const responseTimes = metricPoints.map((m) => m.responseTimeMs);
  const energyCosts = metricPoints.map((m) => m.energyCost);

  const avgResponseTime = mean(responseTimes);
  const avgEnergyCost = mean(energyCosts);
  const stddevResponseTime = stddev(responseTimes);
  const stddevEnergyCost = stddev(energyCosts);

  // Calculate reward (lower response time is better, so we invert)
  const reward = 100 / (avgResponseTime / 50); // Normalized to 50ms baseline
  const rewardVariance = stddevResponseTime;

  const sharpeRatioReward = calculateSharpeRatio([reward]);
  const sharpeRatioLatency = calculateSharpeRatio(responseTimes);

  // Combined score balances performance and sustainability
  // Energy efficiency acts as sustainability factor
  const sustainabilityFactor = 1 - (avgEnergyCost / 0.25); // Normalized to 0.25 max
  const combinedScore =
    (sharpeRatioReward + sharpeRatioLatency) * sustainabilityFactor * 10;

  return {
    strategy,
    avgResponseTime,
    avgEnergyCost,
    stddevResponseTime,
    stddevEnergyCost,
    sharpeRatioReward,
    sharpeRatioLatency,
    combinedScore,
    dataPoints: metricPoints,
  };
}

/**
 * Main handler for UPP evaluator
 */
serve(async (req: Request) => {
  // CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Handle preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const iterations = body.iterations || 1000;
    const realData = body.data || null;

    const strategies = [
      "cache-first",
      "db-priority",
      "edge-compute",
      "hybrid",
    ];
    const evaluatedStrategies: StrategyMetrics[] = [];

    console.log("[UPP Evaluator] Starting evaluation with", iterations, "iterations per strategy");

    // Evaluate each strategy
    for (const strategy of strategies) {
      let metricPoints: MetricDataPoint[];

      if (realData && Array.isArray(realData)) {
        // Use provided real data filtered by strategy
        metricPoints = realData.filter((m) => m.strategy === strategy);
        if (metricPoints.length === 0) {
          // Generate synthetic data if strategy not in real data
          metricPoints = generateMetrics(strategy, iterations);
        }
      } else {
        // Generate simulated metrics
        metricPoints = generateMetrics(strategy, iterations);
      }

      const metrics = evaluateStrategy(strategy, metricPoints);
      evaluatedStrategies.push(metrics);

      // Log strategy results
      console.log(
        `[UPP Evaluator] Simulating ${strategy}...`
      );
      console.log(
        `  - Avg Response Time: ${metrics.avgResponseTime.toFixed(2)}ms`
      );
      console.log(
        `  - Avg Energy Cost: ${metrics.avgEnergyCost.toFixed(4)}`
      );
      console.log(
        `  - Sharpe Ratio (Reward): ${metrics.sharpeRatioReward.toFixed(4)}`
      );
      console.log(
        `  - Sharpe Ratio (Latency): ${metrics.sharpeRatioLatency.toFixed(4)}`
      );
      console.log(`  - Combined Score: ${metrics.combinedScore.toFixed(4)}`);
    }

    // Find best strategy
    const bestStrategy = evaluatedStrategies.reduce((best, current) =>
      current.combinedScore > best.combinedScore ? current : best
    );

    const bestMetrics = evaluatedStrategies.find(
      (s) => s.strategy === bestStrategy.strategy
    )!;

    // Prepare result
    const result: EvaluationResult = {
      summary: {
        avgResponseTime: bestMetrics.avgResponseTime,
        avgEnergyCost: bestMetrics.avgEnergyCost,
        sharpeRatioReward: bestMetrics.sharpeRatioReward,
        sharpeRatioLatency: bestMetrics.sharpeRatioLatency,
        combinedScore: bestMetrics.combinedScore,
      },
      strategies: evaluatedStrategies.map((s) => ({
        strategy: s.strategy,
        avgResponseTime: s.avgResponseTime,
        avgEnergyCost: s.avgEnergyCost,
        stddevResponseTime: s.stddevResponseTime,
        stddevEnergyCost: s.stddevEnergyCost,
        sharpeRatioReward: s.sharpeRatioReward,
        sharpeRatioLatency: s.sharpeRatioLatency,
        combinedScore: s.combinedScore,
        dataPoints: [], // Don't return all data points to save bandwidth
      })),
      recommendation: bestStrategy.strategy.toUpperCase(),
      timestamp: new Date().toISOString(),
    };

    // Log recommendation
    console.log(
      "[UPP Evaluator] ===== RECOMMENDATION ====="
    );
    console.log(`[UPP Evaluator] Best Strategy: ${result.recommendation}`);
    console.log(
      `[UPP Evaluator] Combined Score: ${bestMetrics.combinedScore.toFixed(4)}`
    );
    console.log(
      `[UPP Evaluator] Avg Response Time: ${bestMetrics.avgResponseTime.toFixed(2)}ms`
    );
    console.log(
      `[UPP Evaluator] Avg Energy Cost: ${bestMetrics.avgEnergyCost.toFixed(4)}`
    );
    console.log("[UPP Evaluator] ===========================");

    return new Response(JSON.stringify(result), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
      status: 200,
    });
  } catch (error) {
    console.error("[UPP Evaluator] Error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 500,
      }
    );
  }
});
