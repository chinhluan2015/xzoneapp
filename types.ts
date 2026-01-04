
export interface PricePoint {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface NewsEvent {
  id: string;
  date: string;
  title: string;
  source: string;
  summary: string;
  url: string;
  impact?: ImpactAnalysis;
  clusterId?: string; // For grouping overlapping events
}

export interface ValidationFlag {
  type: 'WARNING' | 'CRITICAL' | 'INFO';
  message: string;
  code: string;
}

export interface ImpactAnalysis {
  xisScore: number;           // XZone Impact Score (0-100)
  zMax: number;               // Max absolute Z-statistic
  volRatio: number;           // Event Vol / Avg Vol
  rangeRatio: number;         // Event Range / Avg Range
  classification: string;     // No Impact, Weak, Moderate, Strong
  observation?: string;       // AI-generated market commentary
  validationFlags: ValidationFlag[]; // Data integrity checks
  returns: {
    imm: number;              // Immediate [0, 1] log return
    short: number;            // Short-term [0, 3] log return
    med: number;              // Medium-term [0, 5] log return
  };
  stats: {
    muPre: number;            // Baseline mean return
    sigmaPre: number;         // Baseline volatility
  };
}

export interface StockData {
  symbol: string;
  prices: PricePoint[];
}

export enum AnalysisStatus {
  IDLE = 'IDLE',
  LOADING_NEWS = 'LOADING_NEWS',
  ANALYZING = 'ANALYZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}
