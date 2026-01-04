
import { PricePoint, ImpactAnalysis, NewsEvent, ValidationFlag } from "../types";

/**
 * Deterministic Quantitative Impact Engine v2.1
 * Includes Data Integrity & Market Noise Validation
 */

export const calculateImpact = (
  eventDate: string,
  prices: PricePoint[],
  baselineOverride?: { mu: number; sigma: number }
): ImpactAnalysis | null => {
  const eventIdx = prices.findIndex(p => p.date === eventDate);
  if (eventIdx === -1 || eventIdx < 11) return null;

  const validationFlags: ValidationFlag[] = [];

  // 1. Estimation Window: [-10, -1]
  const preWindow = prices.slice(eventIdx - 11, eventIdx);
  const preReturns = preWindow.slice(1).map((p, i) => Math.log(p.close / preWindow[i].close));
  
  const muPre = baselineOverride?.mu ?? preReturns.reduce((a, b) => a + b, 0) / preReturns.length;
  const sigmaPre = baselineOverride?.sigma ?? Math.sqrt(
    preReturns.reduce((s, r) => s + Math.pow(r - muPre, 2), 0) / (preReturns.length - 1)
  );

  if (sigmaPre === 0) return null;

  // --- VALIDATION: Volatility Drift Check ---
  const baselineVolAnnualized = sigmaPre * Math.sqrt(252);
  if (baselineVolAnnualized > 0.60) {
    validationFlags.push({
      type: 'WARNING',
      code: 'HIGH_BASELINE_VOL',
      message: 'Baseline nhiễu cao (>60% anlz.), chỉ số Z có thể bị nén (bias thấp).'
    });
  }

  // 2. Event Windows
  const getCAR = (start: number, end: number) => {
    let car = 0;
    const actualEnd = Math.min(eventIdx + end, prices.length - 1);
    for (let i = eventIdx; i <= actualEnd; i++) {
      const r = Math.log(prices[i].close / prices[i - 1].close);
      car += (r - muPre);
    }
    const n = actualEnd - eventIdx + 1;
    const z = car / (sigmaPre * Math.sqrt(n));
    return { car, z, n };
  };

  const imm = getCAR(0, 1);
  const short = getCAR(0, 3);
  const med = getCAR(0, 5);

  const zMax = Math.max(Math.abs(imm.z), Math.abs(short.z), Math.abs(med.z));

  // 3. Volume & Range Shocks
  const avgVol = preWindow.reduce((a, b) => a + b.volume, 0) / preWindow.length;
  const eventVol = prices[eventIdx].volume;
  const volRatio = eventVol / avgVol;

  // --- VALIDATION: Liquidity Check ---
  if (volRatio < 0.8 && Math.abs(imm.car) > 0.02) {
    validationFlags.push({
      type: 'CRITICAL',
      code: 'LOW_LIQUIDITY_SPIKE',
      message: 'Giá biến động mạnh trên khối lượng thấp. Tín hiệu nhiễu cao.'
    });
  }

  const avgRange = preWindow.reduce((a, b) => a + (b.high - b.low), 0) / preWindow.length;
  const rangeRatio = (prices[eventIdx].high - prices[eventIdx].low) / avgRange;

  // 4. XIS Calculation (Weighted)
  let sP = Math.min(100, (zMax / 3.5) * 100);
  let sV = Math.min(100, Math.max(0, (volRatio - 1.0) / 3.0 * 100));
  let sR = Math.min(100, Math.max(0, (rangeRatio - 1.0) / 2.0 * 100));

  // Penalty for low liquidity
  const xisScore = Math.round(((sP * 0.65) + (sV * 0.20) + (sR * 0.15)) * (volRatio < 0.5 ? 0.7 : 1.0));

  let classification = "Negligible";
  if (xisScore > 70) classification = "Structural Shock";
  else if (xisScore > 45) classification = "Market Re-pricing";
  else if (xisScore > 20) classification = "Absorbed Reaction";

  return {
    xisScore,
    zMax,
    volRatio,
    rangeRatio,
    classification,
    validationFlags,
    returns: {
      imm: imm.car,
      short: short.car,
      med: med.car
    },
    stats: {
      muPre,
      sigmaPre
    }
  };
};

export const processEventClusters = (news: NewsEvent[], prices: PricePoint[]): NewsEvent[] => {
  const sortedNews = [...news].sort((a, b) => a.date.localeCompare(b.date));
  const processed: NewsEvent[] = [];
  let currentAnchor: NewsEvent | null = null;
  let anchorStats: { mu: number; sigma: number } | null = null;

  sortedNews.forEach((event) => {
    if (currentAnchor) {
      const diff = (new Date(event.date).getTime() - new Date(currentAnchor.date).getTime()) / (1000 * 3600 * 24);
      if (diff <= 3) {
        const impact = calculateImpact(event.date, prices, anchorStats || undefined);
        if (impact) {
          impact.validationFlags.push({
            type: 'INFO',
            code: 'CLUSTER_INHERITANCE',
            message: `Sự kiện gộp. Kế thừa Baseline từ phiên ${currentAnchor?.date}.`
          });
        }
        processed.push({ ...event, impact, clusterId: currentAnchor.id });
        return;
      }
    }
    const impact = calculateImpact(event.date, prices);
    if (impact) {
      currentAnchor = event;
      anchorStats = { mu: impact.stats.muPre, sigma: impact.stats.sigmaPre };
    }
    processed.push({ ...event, impact });
  });

  return processed;
};
