
import React from 'react';
import { NewsEvent } from '../types';
import { ExternalLink, Clock } from 'lucide-react';

interface NewsTimelineProps {
  events: NewsEvent[];
  selectedId?: string;
  onSelect: (event: NewsEvent) => void;
}

const NewsTimeline: React.FC<NewsTimelineProps> = ({ events, selectedId, onSelect }) => {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 p-8 text-center border-2 border-dashed border-slate-800 rounded-xl">
        <Clock size={32} className="mb-2 opacity-20" />
        <p>No news events found for this period.</p>
        <p className="text-xs">Search for a symbol to fetch real-time news.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto pr-2 max-h-[600px]">
      <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest sticky top-0 bg-[#0f172a] py-2 z-10">
        News Timeline ({events.length})
      </h3>
      {events.map((event) => (
        <div 
          key={event.id}
          onClick={() => onSelect(event)}
          className={`group p-4 rounded-xl border transition-all cursor-pointer ${
            selectedId === event.id 
              ? 'bg-amber-500/10 border-amber-500/50 shadow-lg shadow-amber-500/5' 
              : 'bg-slate-800/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
          }`}
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-mono text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded">
              {event.date}
            </span>
            <a 
              href={event.url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-slate-500 hover:text-emerald-400 transition-colors"
            >
              <ExternalLink size={14} />
            </a>
          </div>
          <h4 className={`text-sm font-bold leading-snug group-hover:text-amber-200 transition-colors ${
             selectedId === event.id ? 'text-amber-400' : 'text-slate-200'
          }`}>
            {event.title}
          </h4>
          <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
            {event.summary}
          </p>
          <div className="mt-3 flex items-center justify-between">
             <span className="text-[10px] uppercase text-slate-500 font-bold">{event.source}</span>
             {event.impact && (
               <span className="text-[10px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded font-bold uppercase">
                 Analyzed
               </span>
             )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NewsTimeline;
