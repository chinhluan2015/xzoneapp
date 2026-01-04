
import React, { useState, useEffect } from 'react';
import { Search, Upload, ChartBar, Map, Terminal, Loader2, AlertTriangle, Database, Trash2, FileJson, FileSpreadsheet, Target } from 'lucide-react';
import StockChart from './components/StockChart';
import NewsTimeline from './components/NewsTimeline';
import ImpactReport from './components/ImpactReport';
import { PricePoint, NewsEvent, StockData, AnalysisStatus } from './types';
import { searchStockNews } from './services/geminiService';
import { calculateImpact, processEventClusters } from './services/impactEngine';
import { parseCSVData, fetchDefaultData } from './services/dataLoader';

const STORAGE_KEY = 'XZONE_DATA_CACHE';
const INVENTORY_KEY = 'XZONE_UPLOADED_INVENTORY';

const DEFAULT_FALLBACK_PRICES: PricePoint[] = Array.from({ length: 60 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (60 - i));
  const base = 25000 + Math.sin(i * 0.1) * 2000;
  return {
    date: date.toISOString().split('T')[0],
    open: base - 100,
    high: base + 300,
    low: base - 300,
    close: base + 50,
    volume: 1000000 + Math.floor(Math.random() * 2000000)
  };
});

function App() {
  const [symbol, setSymbol] = useState('HPG');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [stockData, setStockData] = useState<StockData>({ symbol: 'HPG', prices: DEFAULT_FALLBACK_PRICES });
  const [allUploadedData, setAllUploadedData] = useState<Record<string, PricePoint[]>>({});
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initial Data Load Logic
  useEffect(() => {
    const initApp = async () => {
      const cached = localStorage.getItem(STORAGE_KEY);
      const inventory = localStorage.getItem(INVENTORY_KEY);
      
      let loadedInventory: Record<string, PricePoint[]> = {};
      
      // 1. Try to load inventory from localStorage
      if (inventory) {
        try { 
          loadedInventory = JSON.parse(inventory);
          setAllUploadedData(loadedInventory);
        } catch (e) { console.error(e); }
      }

      // 2. If inventory is empty, fetch the default CSV file
      if (Object.keys(loadedInventory).length === 0) {
        const defaultData = await fetchDefaultData();
        if (Object.keys(defaultData).length > 0) {
          loadedInventory = defaultData;
          setAllUploadedData(defaultData);
          // Set the first symbol as default
          const firstSym = Object.keys(defaultData)[0];
          setSymbol(firstSym);
          setStockData({ symbol: firstSym, prices: defaultData[firstSym] });
        }
      }

      // 3. Load cache for news and active symbol
      if (cached) {
        try {
          const { savedStockData, savedNews, savedSymbol } = JSON.parse(cached);
          if (savedStockData && !inventory) setStockData(savedStockData); // Only override if we didn't just load from CSV
          if (savedNews) setNewsEvents(savedNews);
          if (savedSymbol) setSymbol(savedSymbol);
        } catch (e) { console.error(e); }
      }
    };

    initApp();
  }, []);

  useEffect(() => {
    if (status === AnalysisStatus.IDLE || status === AnalysisStatus.COMPLETED) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ savedStockData: stockData, savedNews: newsEvents, savedSymbol: symbol }));
      localStorage.setItem(INVENTORY_KEY, JSON.stringify(allUploadedData));
    }
  }, [stockData, newsEvents, symbol, allUploadedData, status]);

  const handleSearch = async () => {
    if (!symbol) return;
    
    setStatus(AnalysisStatus.LOADING_NEWS);
    setError(null);
    setSelectedEvent(null);

    try {
      const currentPrices = allUploadedData[symbol] || stockData.prices;
      if (currentPrices.length < 20) {
        throw new Error("Dữ liệu giá quá ngắn để phân tích sự kiện (tối thiểu 20 phiên).");
      }

      const dates = currentPrices.map(p => p.date).sort();
      const start = dates[0];
      const end = dates[dates.length - 1];
      
      const rawNews = await searchStockNews(symbol, start, end);
      
      // Perform Deterministic Impact Analysis + Clustering
      const analyzedNews = processEventClusters(rawNews, currentPrices);
      
      setNewsEvents(analyzedNews);
      setStockData({ symbol, prices: currentPrices });
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      setError(err.message || "Không thể tải tin tức.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      try {
        if (file.name.endsWith('.json')) {
          const json = JSON.parse(content);
          if (json.symbol && Array.isArray(json.price)) {
            const prices = json.price.map((p: any) => ({
              date: p.date, open: Number(p.open), high: Number(p.high), low: Number(p.low), close: Number(p.close), volume: Number(p.volume)
            })).sort((a: any, b: any) => a.date.localeCompare(b.date));
            setAllUploadedData(prev => ({ ...prev, [json.symbol]: prices }));
            setStockData({ symbol: json.symbol, prices });
            setSymbol(json.symbol);
          }
        } else if (file.name.endsWith('.csv')) {
          const inventory = parseCSVData(content);
          setAllUploadedData(prev => ({ ...prev, ...inventory }));
          const first = Object.keys(inventory)[0];
          if (first) { 
            setStockData({ symbol: first, prices: inventory[first] }); 
            setSymbol(first); 
          }
        }
        setError(null);
        setNewsEvents([]);
      } catch (err: any) { setError(`Lỗi xử lý file: ${err.message}`); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg"><Map className="text-slate-900" size={24} /></div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">XZone <span className="text-emerald-500">QUANT ENGINE</span></h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Deterministic Event Study v2.0</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <input type="text" value={symbol} onChange={(e) => setSymbol(e.target.value.toUpperCase())} placeholder="Mã (VD: HPG)" className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm w-32 focus:ring-2 focus:ring-emerald-500/50" />
          <button onClick={handleSearch} disabled={status === AnalysisStatus.LOADING_NEWS} className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
            {status === AnalysisStatus.LOADING_NEWS ? <Loader2 size={16} className="animate-spin" /> : <ChartBar size={16} />} Run Analysis
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 max-w-[1600px] mx-auto w-full">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-lg border border-slate-800 text-xs">
            <div className="flex gap-4">
               <span className="text-slate-400">Inventory: <b className="text-emerald-400">{Object.keys(allUploadedData).length}</b> stocks</span>
               <span className="text-slate-400">Viewing: <b className="text-amber-400">{symbol}</b></span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => {localStorage.clear(); window.location.reload();}} className="text-rose-400 hover:text-rose-300 flex items-center gap-1"><Trash2 size={14}/> Reset Cache</button>
              <label className="text-slate-300 hover:text-white cursor-pointer flex items-center gap-1"><Upload size={14}/> Upload CSV/JSON <input type="file" className="hidden" accept=".json,.csv" onChange={handleFileUpload} /></label>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 p-4 rounded-xl flex items-start gap-3">
              <AlertTriangle className="text-rose-500" size={20} />
              <p className="text-rose-200 text-xs">{error}</p>
            </div>
          )}

          <StockChart prices={stockData.prices} news={newsEvents} onEventClick={setSelectedEvent} />
          
          <div className="grid grid-cols-2 gap-4 opacity-50">
             <div className="border border-slate-800 p-4 rounded-lg bg-slate-950/30 text-[10px] font-mono">
                <p className="text-emerald-500">// ENGINE LOGIC:</p>
                <p>Estimation: [-10, -1] Trading Days</p>
                <p>Returns: Logarithmic (ln(Ct/Ct-1))</p>
                <p>Impact: Z-Score adjusted for Volatility</p>
             </div>
             <div className="border border-slate-800 p-4 rounded-lg bg-slate-950/30 text-[10px] font-mono">
                <p className="text-blue-500">// CLUSTERING:</p>
                <p>Threshold: 3 Days Proximity</p>
                <p>Rule: Baseline Freeze (Preserves Pre-Shock σ)</p>
                <p>Weights: Price (65%) | Vol (20%) | Range (15%)</p>
             </div>
          </div>
        </div>

        <div className="w-full lg:w-[400px] shrink-0 space-y-6">
          {selectedEvent ? (
            <ImpactReport event={selectedEvent} onClose={() => setSelectedEvent(null)} />
          ) : (
            <div className="bg-slate-900/50 h-[300px] rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <div className="bg-slate-800 p-4 rounded-full mb-4"><Target size={32} className="opacity-30" /></div>
              <p className="font-bold text-sm text-slate-400">Select Marker</p>
              <p className="text-xs mt-1">Click a news marker on the chart to view its quantitative impact analysis.</p>
            </div>
          )}
          <div className="h-[calc(100vh-550px)] min-h-[400px]">
            <NewsTimeline events={newsEvents} selectedId={selectedEvent?.id} onSelect={setSelectedEvent} />
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
