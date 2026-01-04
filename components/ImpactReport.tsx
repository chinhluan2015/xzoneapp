
import React, { useState, useEffect } from 'react';
import { NewsEvent } from '../types';
import { Newspaper, BarChart3, Activity, MessageSquareQuote, Loader2, Info, AlertTriangle, ShieldCheck } from 'lucide-react';
import { generateMarketObservation } from '../services/geminiService';

interface ImpactReportProps {
  event: NewsEvent;
  onClose: () => void;
}

const ImpactReport: React.FC<ImpactReportProps> = ({ event, onClose }) => {
  const [observation, setObservation] = useState<string | null>(event.impact?.observation || null);
  const [loadingObservation, setLoadingObservation] = useState(false);

  useEffect(() => {
    if (event.impact && !event.impact.observation && !observation) {
      fetchObservation();
    } else if (event.impact?.observation) {
      setObservation(event.impact.observation);
    }
  }, [event.id]);

  const fetchObservation = async () => {
    if (!event.impact) return;
    setLoadingObservation(true);
    try {
      const obs = await generateMarketObservation(event.title, event.impact);
      setObservation(obs);
    } catch (err) {
      console.error("Failed to load observation", err);
    } finally {
      setLoadingObservation(false);
    }
  };

  if (!event.impact) return null;

  const { impact } = event;

  return (
    <div className="bg-slate-800 border border-slate-700 rounded-xl overflow-hidden shadow-2xl animate-in slide-in-from-right fade-in flex flex-col max-h-full">
      <div className="bg-slate-900 p-4 border-b border-slate-700 flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full border-4 flex items-center justify-center font-black text-lg ${
            impact.xisScore > 70 ? 'border-rose-500 text-rose-500' :
            impact.xisScore > 45 ? 'border-amber-500 text-amber-500' :
            'border-emerald-500 text-emerald-500'
          }`}>
            {impact.xisScore}
          </div>
          <div>
            <h3 className="text-white font-bold text-sm uppercase">XZone Impact Score</h3>
            <p className={`text-[10px] font-bold uppercase tracking-widest ${
               impact.xisScore > 70 ? 'text-rose-400' :
               impact.xisScore > 45 ? 'text-amber-400' :
               'text-emerald-400'
            }`}>{impact.classification}</p>
          </div>
        </div>
        <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors text-2xl px-2">&times;</button>
      </div>

      <div className="p-6 space-y-6 overflow-y-auto">
        {/* VALIDATION FLAGS SECTION */}
        {impact.validationFlags.length > 0 && (
          <div className="space-y-2">
            {impact.validationFlags.map((flag, idx) => (
              <div key={idx} className={`p-2 rounded text-[10px] flex items-start gap-2 border ${
                flag.type === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' :
                flag.type === 'WARNING' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                'bg-blue-500/10 border-blue-500/30 text-blue-400'
              }`}>
                <AlertTriangle size={12} className="shrink-0 mt-0.5" />
                <span><b>{flag.code}:</b> {flag.message}</span>
              </div>
            ))}
          </div>
        )}

        <div>
          <h4 className="text-lg font-bold text-white mb-2 leading-tight flex items-center gap-2">
            <Newspaper size={16} className="text-slate-400" /> {event.title}
          </h4>
          <p className="text-xs text-slate-400 italic">"{event.summary}"</p>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <StatCard title="CAR [0,1]" value={(impact.returns.imm * 100).toFixed(2) + '%'} sub="Immediate" />
          <StatCard title="CAR [0,3]" value={(impact.returns.short * 100).toFixed(2) + '%'} sub="Short-term" />
          <StatCard title="CAR [0,5]" value={(impact.returns.med * 100).toFixed(2) + '%'} sub="Medium-term" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-3 text-blue-400 font-bold text-xs uppercase tracking-wider">
              <Activity size={14} /> Statistical Significance
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Max Z-Statistic</p>
                <p className="text-lg font-mono text-slate-200">{impact.zMax.toFixed(2)}σ</p>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full" 
                  style={{ width: `${Math.min(100, (impact.zMax / 3.5) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <BarChart3 size={14} /> Conviction Metrics
            </div>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Vol Ratio</p>
                <p className={`text-sm font-mono ${impact.volRatio < 1 ? 'text-rose-400' : 'text-slate-200'}`}>
                  {impact.volRatio.toFixed(2)}x
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Range Ratio</p>
                <p className="text-sm font-mono text-slate-200">{impact.rangeRatio.toFixed(2)}x</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="bg-slate-900 px-3 py-2 border-b border-slate-700/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              <MessageSquareQuote size={12} className="text-amber-500" />
              Market Observation
            </div>
            <div className="flex items-center gap-1">
               <ShieldCheck size={10} className="text-emerald-500" />
               <span className="text-[8px] text-slate-500 font-mono uppercase">Verified Node</span>
            </div>
          </div>
          <div className="p-4 relative">
            {loadingObservation ? (
              <div className="flex flex-col items-center justify-center py-4 space-y-2">
                <Loader2 size={18} className="animate-spin text-amber-500" />
                <span className="text-[9px] text-slate-500 uppercase font-mono animate-pulse">Processing Narrative...</span>
              </div>
            ) : (
              <p className="text-xs text-slate-300 leading-relaxed font-medium">
                {observation || "No observation generated."}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, sub }: { title: string, value: string, sub: string }) => {
  const isUp = parseFloat(value) > 0;
  return (
    <div className="bg-slate-900/30 p-2 rounded border border-slate-700/50 text-center">
      <p className="text-[9px] text-slate-500 font-bold uppercase">{title}</p>
      <p className={`text-xs font-black font-mono my-1 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isUp ? '+' : ''}{value}
      </p>
      <p className="text-[8px] text-slate-600 uppercase">{sub}</p>
    </div>
  );
};

export default ImpactReport;
