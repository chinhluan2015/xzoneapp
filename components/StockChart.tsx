
import React, { useEffect, useRef, useMemo } from 'react';
import { createChart, ColorType, ISeriesApi, IChartApi, MouseEventParams } from 'lightweight-charts';
import { PricePoint, NewsEvent } from '../types';

interface StockChartProps {
  prices: PricePoint[];
  news: NewsEvent[];
  onEventClick: (event: NewsEvent) => void;
}

const StockChart: React.FC<StockChartProps> = ({ prices, news, onEventClick }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null);

  // Candlestick data
  const formattedData = useMemo(() => {
    return prices.map(p => ({
      time: p.date,
      open: p.open,
      high: p.high,
      low: p.low,
      close: p.close,
    })).sort((a, b) => a.time.localeCompare(b.time));
  }, [prices]);

  // Volume data with dynamic coloring
  const volumeData = useMemo(() => {
    return prices.map(p => ({
      time: p.date,
      value: p.volume,
      color: p.close >= p.open ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)',
    })).sort((a, b) => a.time.localeCompare(b.time));
  }, [prices]);

  // Markers logic
  const markers = useMemo(() => {
    return news.map(n => ({
      time: n.date,
      position: 'aboveBar' as const,
      color: '#f59e0b',
      shape: 'circle' as const,
      text: 'News',
      id: n.id,
    })).sort((a, b) => a.time.localeCompare(b.time));
  }, [news]);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Initialize Chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#94a3b8',
      },
      grid: {
        vertLines: { color: '#1e293b' },
        horzLines: { color: '#1e293b' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        borderColor: '#334155',
        barSpacing: 12,
        timeVisible: true,
      },
      rightPriceScale: {
        borderColor: '#334155',
        scaleMargins: {
          top: 0.1,
          bottom: 0.25, // Leave room for volume at the bottom
        },
      },
      crosshair: {
        vertLine: { labelBackgroundColor: '#0f172a' },
        horzLine: { labelBackgroundColor: '#0f172a' },
      },
    });

    // Add Candlestick Series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#f43f5e',
      borderVisible: false,
      wickUpColor: '#10b981',
      wickDownColor: '#f43f5e',
    });

    // Add Volume Series (Histogram)
    const volumeSeries = chart.addHistogramSeries({
      priceFormat: {
        type: 'volume',
      },
      priceScaleId: 'volume', // Separate scale for volume overlay
    });

    // Configure volume overlay scale
    chart.priceScale('volume').applyOptions({
      scaleMargins: {
        top: 0.75, // Volume occupies the bottom 25%
        bottom: 0,
      },
    });

    chartRef.current = chart;
    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

    // Handle Click on Markers
    const handleMouseClick = (param: MouseEventParams) => {
      if (!param.time) return;
      
      const clickedDate = param.time.toString();
      const eventsOnDate = news.filter(n => n.date === clickedDate);
      
      if (eventsOnDate.length > 0) {
        onEventClick(eventsOnDate[0]);
      }
    };

    chart.subscribeClick(handleMouseClick);

    // Resize Handling
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.unsubscribeClick(handleMouseClick);
      chart.remove();
    };
  }, [news, onEventClick]);

  // Update data and markers
  useEffect(() => {
    if (candlestickSeriesRef.current && volumeSeriesRef.current && formattedData.length > 0) {
      candlestickSeriesRef.current.setData(formattedData);
      volumeSeriesRef.current.setData(volumeData);
      candlestickSeriesRef.current.setMarkers(markers);
      
      if (chartRef.current) {
        chartRef.current.timeScale().fitContent();
      }
    }
  }, [formattedData, volumeData, markers]);

  return (
    <div className="w-full bg-slate-900/50 rounded-xl border border-slate-800 p-4 shadow-inner">
      <div className="flex justify-between items-center mb-4 px-2">
         <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            TradingView Advanced Charting (OHLC + Vol)
         </h2>
         <div className="flex gap-4 text-[10px] font-bold uppercase">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-sm"></span> <span className="text-slate-400">Bullish</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-rose-500 rounded-sm"></span> <span className="text-slate-400">Bearish</span></div>
            <div className="flex items-center gap-1.5"><span className="w-4 h-4 rounded-full border border-amber-500 flex items-center justify-center text-amber-500 text-[8px]">N</span> <span className="text-slate-400">News Marker</span></div>
         </div>
      </div>
      
      <div ref={chartContainerRef} className="relative w-full h-[500px]" />
      
      <div className="mt-2 text-[10px] text-slate-600 flex justify-between px-2">
        <span>Scroll: Zoom • Drag: Pan • Click Marker: Analysis • Bottom: Volume Histogram</span>
        <span className="font-mono uppercase tracking-tighter italic">Powered by Lightweight Charts™</span>
      </div>
    </div>
  );
};

export default StockChart;
