
import React, { useMemo } from 'react';
import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Scatter,
  Cell,
  ReferenceLine
} from 'recharts';
import { PricePoint, NewsEvent } from '../types';

interface StockChartProps {
  prices: PricePoint[];
  news: NewsEvent[];
  onEventClick: (event: NewsEvent) => void;
}

const StockChart: React.FC<StockChartProps> = ({ prices, news, onEventClick }) => {
  const chartData = useMemo(() => {
    return prices.map((p) => {
      const dayNews = news.filter(n => n.date === p.date);
      const isUp = p.close >= p.open;
      return {
        ...p,
        // Wick range: [low, high]
        wick: [p.low, p.high],
        // Body range: [open, close]
        body: isUp ? [p.open, p.close] : [p.close, p.open],
        color: isUp ? '#10b981' : '#f43f5e',
        newsCount: dayNews.length > 0 ? 1 : 0,
        newsEvents: dayNews,
      };
    });
  }, [prices, news]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isUp = data.close >= data.open;
      return (
        <div className="bg-slate-800 border border-slate-700 p-4 rounded-lg shadow-2xl text-xs">
          <p className="font-bold text-slate-300 mb-2 border-b border-slate-700 pb-1">{label}</p>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 font-mono">
            <span className="text-slate-500">Mở:</span>
            <span className="text-slate-300 text-right">{data.open.toLocaleString()}</span>
            
            <span className="text-slate-500">Cao:</span>
            <span className="text-slate-300 text-right">{data.high.toLocaleString()}</span>
            
            <span className="text-slate-500">Thấp:</span>
            <span className="text-slate-300 text-right">{data.low.toLocaleString()}</span>
            
            <span className="text-slate-500">Đóng:</span>
            <span className={`text-right font-bold ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {data.close.toLocaleString()}
            </span>

            <span className="text-slate-500 mt-1">Khối lượng:</span>
            <span className="text-blue-400 text-right mt-1">{data.volume.toLocaleString()}</span>
          </div>
          
          {data.newsEvents && data.newsEvents.length > 0 && (
            <div className="mt-3 pt-2 border-t border-slate-700">
              <p className="text-amber-400 text-[10px] font-black uppercase mb-1 tracking-wider">News Event:</p>
              {data.newsEvents.map((n: NewsEvent, i: number) => (
                <p key={i} className="text-slate-200 leading-tight mb-1 truncate max-w-[180px]">
                  • {n.title}
                </p>
              ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[550px] bg-slate-900/50 rounded-xl border border-slate-800 p-4 shadow-inner">
      <div className="flex justify-between items-center mb-4 px-2">
         <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Japanese Candlestick Chart
         </h2>
         <div className="flex gap-4 text-[10px] font-bold uppercase">
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-sm"></span> <span className="text-slate-400">Tăng</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-rose-500 rounded-sm"></span> <span className="text-slate-400">Giảm</span></div>
            <div className="flex items-center gap-1.5"><span className="w-2 h-2 bg-amber-500 rounded-full"></span> <span className="text-slate-400">Tin tức</span></div>
         </div>
      </div>
      <ResponsiveContainer width="100%" height="90%">
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
          <XAxis 
            dataKey="date" 
            stroke="#475569" 
            tick={{ fontSize: 10 }}
            tickFormatter={(val) => val.split('-').slice(1).join('/')}
            axisLine={false}
          />
          <YAxis 
            yAxisId="price"
            orientation="right" 
            stroke="#475569" 
            tick={{ fontSize: 10, fontFamily: 'monospace' }} 
            domain={['auto', 'auto']}
            axisLine={false}
          />
          <YAxis 
            yAxisId="vol"
            orientation="left" 
            stroke="#334155" 
            hide
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#334155', strokeWidth: 1 }} />
          
          {/* Volume Bars at the bottom */}
          <Bar 
            yAxisId="vol"
            dataKey="volume" 
            opacity={0.15} 
            barSize={20}
          >
            {chartData.map((entry, index) => (
              <Cell key={`vol-cell-${index}`} fill={entry.color} />
            ))}
          </Bar>

          {/* Candle Wick (Low-High) */}
          <Bar 
            yAxisId="price"
            dataKey="wick" 
            barSize={1}
            fill="#64748b"
          >
            {chartData.map((entry, index) => (
              <Cell key={`wick-cell-${index}`} fill={entry.color} />
            ))}
          </Bar>

          {/* Candle Body (Open-Close) */}
          <Bar 
            yAxisId="price"
            dataKey="body" 
            barSize={12}
          >
            {chartData.map((entry, index) => (
              <Cell key={`body-cell-${index}`} fill={entry.color} />
            ))}
          </Bar>

          {/* News Markers Mapping */}
          <Scatter 
            yAxisId="price"
            dataKey="newsCount"
          >
            {chartData.map((entry, index) => {
              if (entry.newsCount > 0) {
                return (
                  <Cell 
                    key={`news-scatter-${index}`} 
                    fill="#f59e0b" 
                    className="cursor-pointer hover:scale-125 transition-transform"
                    onClick={() => entry.newsEvents && onEventClick(entry.newsEvents[0])}
                    // Visual marker just above the candle high
                    cx={index} 
                    cy={entry.high}
                  />
                );
              }
              return null;
            })}
          </Scatter>
          
          {/* Vertical news highlights */}
          {chartData.map((d, i) => d.newsCount > 0 ? (
            <ReferenceLine 
                key={`ref-${i}`} 
                x={d.date} 
                stroke="#f59e0b" 
                strokeDasharray="3 3" 
                strokeWidth={1}
                opacity={0.3}
                yAxisId="price"
            />
          ) : null)}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
