import React from 'react';
import { 
  AlertOctagon, 
  Flame, 
  CheckCircle, 
  Clock, 
  ShieldAlert, 
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function IncidentCenter({ incidents = [], onResolveIncident, onAcknowledgeIncident }) {
  const getSevBadge = (severity) => {
    switch (severity) {
      case 'SEV-1':
        return 'bg-rose-950 text-rose-300 border-rose-600 animate-pulse font-bold';
      case 'SEV-2':
        return 'bg-amber-950 text-amber-300 border-amber-600 font-semibold';
      case 'SEV-3':
        return 'bg-blue-950 text-blue-300 border-blue-600';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'OPEN':
      case 'INVESTIGATING':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'MITIGATING':
      case 'ACKNOWLEDGED':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'RESOLVED':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const activeIncidents = incidents.filter(inc => inc.status !== 'RESOLVED');

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 backdrop-blur-sm shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            Production Incidents
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time alerting, blast radius & MTTR tracker
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono border ${
            activeIncidents.length > 0 
              ? 'bg-rose-950/60 text-rose-300 border-rose-800 animate-pulse' 
              : 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
          }`}>
            {activeIncidents.length} Active
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {incidents.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs flex flex-col items-center gap-1.5">
            <CheckCircle className="w-6 h-6 text-emerald-500/60" />
            <span>All systems fully operational. No active production incidents.</span>
          </div>
        ) : (
          incidents.slice(0, 4).map((inc) => (
            <div
              key={inc.id}
              className={`p-3.5 rounded-lg border transition-all ${
                inc.status === 'RESOLVED'
                  ? 'bg-slate-950/30 border-slate-800/40 opacity-70'
                  : inc.severity === 'SEV-1'
                  ? 'bg-rose-950/20 border-rose-800/60 shadow-sm shadow-rose-950/50'
                  : 'bg-slate-950/50 border-slate-800/80'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono border uppercase ${getSevBadge(inc.severity)}`}>
                    {inc.severity}
                  </span>
                  <div>
                    <h3 className="font-semibold text-sm text-slate-100 flex items-center gap-2">
                      {inc.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-1">
                      <span>Affected: <strong className="text-slate-200">{inc.affectedService}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        {inc.timeAgo || '12m ago'}
                      </span>
                      <span>•</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-mono border ${getStatusBadge(inc.status)}`}>
                        {inc.status}
                      </span>
                    </div>
                  </div>
                </div>

                {inc.status !== 'RESOLVED' && (
                  <div className="flex items-center gap-2 pt-2 sm:pt-0">
                    <button
                      onClick={() => onAcknowledgeIncident && onAcknowledgeIncident(inc.id)}
                      className="px-2.5 py-1 rounded text-xs font-medium bg-slate-850 hover:bg-slate-800 text-slate-300 border border-slate-700 transition-all"
                    >
                      Ack
                    </button>
                    <button
                      onClick={() => onResolveIncident && onResolveIncident(inc.id)}
                      className="px-3 py-1 rounded text-xs font-medium bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-all"
                    >
                      Resolve
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
