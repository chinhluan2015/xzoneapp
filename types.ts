
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
}

export interface ImpactAnalysis {
  plus1d: string;
  plus3d: string;
  plus5d: string;
  volVsAvg: string;
  volStatus: 'Spike' | 'Normal' | 'Low';
  observation: string;
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
