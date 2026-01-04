
import React, { useState, useEffect } from 'react';
import { Search, Upload, Info, ChartBar, Map, Terminal, Loader2, AlertTriangle, Database, Trash2, FileJson, FileSpreadsheet } from 'lucide-react';
import StockChart from './components/StockChart';
import NewsTimeline from './components/NewsTimeline';
import ImpactReport from './components/ImpactReport';
import { PricePoint, NewsEvent, StockData, AnalysisStatus } from './types';
import { searchStockNews, analyzeNewsImpact } from './services/geminiService';

const STORAGE_KEY = 'XZONE_DATA_CACHE';
const INVENTORY_KEY = 'XZONE_UPLOADED_INVENTORY';

const DEFAULT_PRICES: PricePoint[] = Array.from({ length: 40 }).map((_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (40 - i));
  const base = 25000 + Math.sin(i * 0.2) * 2000;
  return {
    date: date.toISOString().split('T')[0],
    open: base - Math.random() * 200,
    high: base + 500 + Math.random() * 300,
    low: base - 500 - Math.random() * 300,
    close: base + (Math.random() - 0.5) * 600,
    volume: 1000000 + Math.floor(Math.random() * 5000000)
  };
});

function App() {
  const [symbol, setSymbol] = useState('HPG');
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [stockData, setStockData] = useState<StockData>({ symbol: 'HPG', prices: DEFAULT_PRICES });
  const [allUploadedData, setAllUploadedData] = useState<Record<string, PricePoint[]>>({});
  const [newsEvents, setNewsEvents] = useState<NewsEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<NewsEvent | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load data from LocalStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem(STORAGE_KEY);
    const inventory = localStorage.getItem(INVENTORY_KEY);
    if (cached) {
      try {
        const { savedStockData, savedNews, savedSymbol } = JSON.parse(cached);
        if (savedStockData) setStockData(savedStockData);
        if (savedNews) setNewsEvents(savedNews);
        if (savedSymbol) setSymbol(savedSymbol);
      } catch (e) {
        console.error("Failed to load cache", e);
      }
    }
    if (inventory) {
      try {
        setAllUploadedData(JSON.parse(inventory));
      } catch (e) {
        console.error("Failed to load inventory", e);
      }
    }
  }, []);

  // Sync data to LocalStorage
  useEffect(() => {
    const dataToSave = {
      savedStockData: stockData,
      savedNews: newsEvents,
      savedSymbol: symbol
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    localStorage.setItem(INVENTORY_KEY, JSON.stringify(allUploadedData));
  }, [stockData, newsEvents, symbol, allUploadedData]);

  const handleSearch = async () => {
    if (!symbol) return;
    
    // Check if symbol exists in uploaded inventory
    if (allUploadedData[symbol]) {
      setStockData({ symbol, prices: allUploadedData[symbol] });
    }

    setStatus(AnalysisStatus.LOADING_NEWS);
    setError(null);
    setNewsEvents([]);
    setSelectedEvent(null);

    try {
      const currentPrices = allUploadedData[symbol] || stockData.prices;
      const dates = currentPrices.map(p => p.date).sort();
      const start = dates[0];
      const end = dates[dates.length - 1];
      
      const foundNews = await searchStockNews(symbol, start, end);
      setNewsEvents(foundNews);
      setStatus(AnalysisStatus.COMPLETED);
    } catch (err: any) {
      console.error(err);
      setError("Không thể tải tin tức. Vui lòng kiểm tra kết nối mạng.");
      setStatus(AnalysisStatus.ERROR);
    }
  };

  const parseCSV = (text: string): Record<string, PricePoint[]> => {
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
    if (lines.length < 2) throw new Error("File CSV không có dữ liệu.");

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const rows = lines.slice(1);

    const sIdx = headers.findIndex(h => h.includes('symbol') || h.includes('ticker') || h.includes('mã'));
    const dIdx = headers.findIndex(h => h.includes('date') || h.includes('ngày'));
    const oIdx = headers.findIndex(h => h.includes('open') || h.includes('mở'));
    const hIdx = headers.findIndex(h => h.includes('high') || h.includes('cao'));
    const lIdx = headers.findIndex(h => h.includes('low') || h.includes('thấp'));
    const cIdx = headers.findIndex(h => h.includes('close') || h.includes('đóng'));
    const vIdx = headers.findIndex(h => h.includes('vol'));

    if (dIdx === -1 || cIdx === -1) throw new Error("File CSV thiếu cột Ngày (Date) hoặc Giá đóng cửa (Close).");

    const inventory: Record<string, PricePoint[]> = {};

    rows.forEach(row => {
      const cols = row.split(',');
      const sym = sIdx !== -1 ? cols[sIdx].trim().toUpperCase() : 'UNKNOWN';
      
      let rawDate = cols[dIdx].trim();
      // Normalize YYYYMMDD to YYYY-MM-DD
      if (/^\d{8}$/.test(rawDate)) {
        rawDate = `${rawDate.slice(0, 4)}-${rawDate.slice(4, 6)}-${rawDate.slice(6, 8)}`;
      } else {
        rawDate = rawDate.replace(/\//g, '-');
      }

      const p: PricePoint = {
        date: rawDate,
        open: parseFloat(cols[oIdx]) || 0,
        high: parseFloat(cols[hIdx]) || 0,
        low: parseFloat(cols[lIdx]) || 0,
        close: parseFloat(cols[cIdx]) || 0,
        volume: parseInt(cols[vIdx]) || 0
      };

      if (!inventory[sym]) inventory[sym] = [];
      inventory[sym].push(p);
    });

    // Sort prices by date for each symbol
    Object.keys(inventory).forEach(s => {
      inventory[s].sort((a, b) => a.date.localeCompare(b.date));
    });

    return inventory;
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
              date: p.date,
              open: Number(p.open),
              high: Number(p.high),
              low: Number(p.low),
              close: Number(p.close),
              volume: Number(p.volume)
            })).sort((a: any, b: any) => a.date.localeCompare(b.date));
            
            setAllUploadedData(prev => ({ ...prev, [json.symbol]: prices }));
            setStockData({ symbol: json.symbol, prices });
            setSymbol(json.symbol);
            setError(null);
          }
        } else if (file.name.endsWith('.csv')) {
          const inventory = parseCSV(content);
          setAllUploadedData(inventory);
          
          // Switch to the first symbol found in CSV
          const firstSym = Object.keys(inventory)[0];
          if (firstSym) {
            setStockData({ symbol: firstSym, prices: inventory[firstSym] });
            setSymbol(firstSym);
          }
          setError(null);
        }
        setNewsEvents([]);
      } catch (err: any) {
        setError(`Lỗi xử lý file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleEventSelect = async (event: NewsEvent) => {
    setSelectedEvent(event);
    if (!event.impact) {
      setStatus(AnalysisStatus.ANALYZING);
      try {
        const impact = await analyzeNewsImpact(symbol, event, stockData.prices);
        setNewsEvents(prev => prev.map(n => n.id === event.id ? { ...n, impact } : n));
        setSelectedEvent(prev => prev && prev.id === event.id ? { ...prev, impact } : prev);
        setStatus(AnalysisStatus.COMPLETED);
      } catch (err) {
        console.error("Impact analysis failed", err);
        setStatus(AnalysisStatus.COMPLETED);
      }
    }
  };

  const clearAllData = () => {
    if (window.confirm("Xóa toàn bộ dữ liệu lưu trữ?")) {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(INVENTORY_KEY);
      setStockData({ symbol: 'HPG', prices: DEFAULT_PRICES });
      setAllUploadedData({});
      setNewsEvents([]);
      setSymbol('HPG');
      setSelectedEvent(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 flex flex-col">
      <header className="sticky top-0 z-50 bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg shadow-lg shadow-emerald-500/20">
            <Map className="text-slate-900" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight flex items-center gap-2">
              XZone <span className="text-emerald-500">NEWS MAP</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Market Observation Engine v1.0</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <input 
              type="text" 
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="Mã cổ phiếu (VD: HPG)"
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 w-48 transition-all"
            />
            <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
          </div>
          <button 
            onClick={handleSearch}
            disabled={status === AnalysisStatus.LOADING_NEWS || !symbol}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all active:scale-95"
          >
            {status === AnalysisStatus.LOADING_NEWS ? <Loader2 size={16} className="animate-spin" /> : <ChartBar size={16} />}
            Mapping News
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col lg:flex-row p-6 gap-6 max-w-[1600px] mx-auto w-full">
        <div className="flex-1 space-y-6">
          <div className="flex items-center justify-between bg-slate-900/40 p-3 rounded-lg border border-slate-800">
            <div className="flex items-center gap-4 text-sm">
               <div className="flex items-center gap-2 text-slate-400">
                 <Database size={14} />
                 <span>Kho dữ liệu: <span className="text-emerald-400 font-mono">{Object.keys(allUploadedData).length} mã</span></span>
               </div>
               <div className="w-px h-4 bg-slate-700" />
               <div className="flex items-center gap-2 text-slate-400">
                 <Terminal size={14} />
                 <span>Đang xem: <span className="text-amber-400 font-bold">{symbol}</span></span>
               </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                onClick={clearAllData}
                className="flex items-center gap-2 text-xs bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 px-3 py-1.5 rounded transition-colors text-rose-400"
              >
                <Trash2 size={14} /> Xóa Cache
              </button>
              <label className="flex items-center gap-2 text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1.5 rounded cursor-pointer transition-colors text-slate-300">
                <Upload size={14} /> Upload (CSV/JSON)
                <input type="file" className="hidden" accept=".json,.csv" onChange={handleFileUpload} />
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-rose-500/10 border border-rose-500/50 p-4 rounded-xl flex items-start gap-3 animate-in fade-in slide-in-from-top-2">
              <AlertTriangle className="text-rose-500 flex-shrink-0" size={20} />
              <div>
                <p className="text-rose-200 text-sm font-bold">Lỗi dữ liệu</p>
                <p className="text-rose-400 text-xs">{error}</p>
              </div>
            </div>
          )}

          <StockChart 
            prices={stockData.prices} 
            news={newsEvents} 
            onEventClick={handleEventSelect}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
               <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                 <FileSpreadsheet size={14} className="text-emerald-500" /> CSV Format Support
               </h3>
               <div className="text-[11px] text-slate-400 space-y-2 font-mono bg-slate-950/50 p-3 rounded">
                 <p className="text-emerald-500">// Header mẫu (AmiBroker):</p>
                 <p>Ticker,Date,Open,High,Low,Close,Volume</p>
                 <p>HPG,20250520,28500,29000,28400,28800,1500000</p>
               </div>
               <p className="text-[10px] text-slate-500 mt-3 italic">* Hỗ trợ file CSV chứa nhiều mã cổ phiếu khác nhau.</p>
            </div>
            
            <div className="bg-slate-900/50 p-5 rounded-xl border border-slate-800">
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                 <FileJson size={14} className="text-blue-500" /> JSON Format Support
               </h3>
               <div className="text-[11px] text-slate-400 space-y-2 font-mono bg-slate-950/50 p-3 rounded">
                 <p className="text-blue-500">// Cấu trúc JSON:</p>
                 <p>{"{ \"symbol\": \"HPG\", \"price\": [...] }"}</p>
               </div>
               <p className="text-[10px] text-slate-500 mt-3 italic">* Phù hợp để lưu trữ dữ liệu đã qua xử lý.</p>
            </div>
          </div>
        </div>

        <div className="w-full lg:w-[400px] shrink-0 space-y-6">
          {selectedEvent ? (
            <ImpactReport 
              event={selectedEvent} 
              onClose={() => setSelectedEvent(null)} 
            />
          ) : (
            <div className="bg-slate-900/50 h-[300px] rounded-xl border border-slate-800 flex flex-col items-center justify-center text-slate-500 p-8 text-center">
              <div className="bg-slate-800 p-4 rounded-full mb-4">
                <Map size={32} className="opacity-30" />
              </div>
              <p className="font-bold text-sm text-slate-400">Chưa chọn sự kiện</p>
              <p className="text-xs mt-1">Chọn một điểm đánh dấu trên biểu đồ hoặc danh sách tin tức để xem phân tích tác động.</p>
            </div>
          )}

          <div className="bg-[#0f172a] p-1 h-[calc(100vh-500px)] min-h-[400px]">
            <NewsTimeline 
              events={newsEvents} 
              selectedId={selectedEvent?.id}
              onSelect={handleEventSelect} 
            />
          </div>
        </div>
      </main>

      {status === AnalysisStatus.ANALYZING && (
        <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center">
          <Loader2 size={48} className="text-emerald-500 animate-spin mb-4" />
          <p className="text-lg font-bold text-emerald-400 animate-pulse">Đang phân tích tác động...</p>
          <p className="text-slate-500 text-sm mt-2 font-mono">Trích xuất phản ứng OHLCV</p>
        </div>
      )}
    </div>
  );
}

export default App;
