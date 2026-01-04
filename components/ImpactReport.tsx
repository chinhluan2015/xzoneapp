
import React from 'react';
import { NewsEvent, ImpactAnalysis } from '../types';
import { AlertCircle, TrendingUp, TrendingDown, Info, Newspaper, BarChart3 } from 'lucide-react';

interface ImpactReportProps {
  event: NewsEvent;
  onClose: () => void;
}

const ImpactReport: React.FC<ImpactReportProps> = ({ event, onClose }) => {
  if (!event.impact) return null;

  const { impact } = event;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-right fade-in">
      <div className="bg-slate-900/80 p-4 border-b border-slate-700 flex justify-between items-center">
        <h3 className="text-amber-400 font-bold flex items-center gap-2">
          <Newspaper size={18} /> Impact Analysis
        </h3>
        <button 
          onClick={onClose}
          className="text-slate-400 hover:text-white transition-colors"
        >
          &times;
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* News Header */}
        <div>
          <h4 className="text-xl font-bold text-white mb-2 leading-tight">{event.title}</h4>
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>{event.date}</span>
            <span className="bg-slate-700 px-2 py-0.5 rounded text-xs">{event.source}</span>
          </div>
          <p className="mt-3 text-slate-300 text-sm leading-relaxed italic border-l-2 border-slate-600 pl-3">
            "{event.summary}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ReactionCard title="+1 Day" value={impact.plus1d} />
          <ReactionCard title="+3 Days" value={impact.plus3d} />
          <ReactionCard title="+5 Days" value={impact.plus5d} />
        </div>

        <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-3 text-emerald-400 font-semibold">
            <BarChart3 size={18} /> Volume Dynamics
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Vs 10D Avg</p>
              <p className="text-slate-200">{impact.volVsAvg}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">Status</p>
              <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${
                impact.volStatus === 'Spike' ? 'bg-amber-500/20 text-amber-500' : 
                impact.volStatus === 'Low' ? 'bg-blue-500/20 text-blue-500' : 
                'bg-slate-500/20 text-slate-400'
              }`}>
                {impact.volStatus}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2 text-blue-400 font-semibold">
            <Info size={18} /> Market Observation
          </div>
          <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-line">
            {impact.observation}
          </p>
        </div>

        <div className="text-[10px] text-slate-500 italic flex items-center gap-1">
          <AlertCircle size={10} />
          Disclaimer: Phân tích dữ liệu quá khứ, không phải khuyến nghị đầu tư.
        </div>
      </div>
    </div>
  );
};

const ReactionCard = ({ title, value }: { title: string, value: string }) => {
  const isUp = value.includes('+') || (!value.includes('-') && parseFloat(value) > 0);
  const isDown = value.includes('-');

  return (
    <div className="bg-slate-900/50 p-3 rounded-lg border border-slate-700 text-center">
      <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">{title}</p>
      <div className={`flex items-center justify-center gap-1 font-mono font-bold ${isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-slate-300'}`}>
        {isUp && <TrendingUp size={14} />}
        {isDown && <TrendingDown size={14} />}
        {value}
      </div>
    </div>
  );
};

export default ImpactReport;
