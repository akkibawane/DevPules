import React from 'react';
import { 
  Zap, 
  Play, 
  Flame, 
  GitCommit, 
  Server, 
  CheckCircle2, 
  XCircle, 
  TrendingUp 
} from 'lucide-react';

export default function SimulationControls({ onSimulate }) {
  const actions = [
    {
      label: 'Deploy Canary',
      type: 'DEPLOY',
      payload: { environment: 'canary' },
      icon: Server,
      color: 'text-purple-400',
      border: 'hover:border-purple-500/50',
    },
    {
      label: 'Build Success',
      type: 'BUILD_SUCCESS',
      payload: { status: 'SUCCESS' },
      icon: CheckCircle2,
      color: 'text-emerald-400',
      border: 'hover:border-emerald-500/50',
    },
    {
      label: 'Build Failure',
      type: 'BUILD_FAILURE',
      payload: { status: 'FAILED' },
      icon: XCircle,
      color: 'text-rose-400',
      border: 'hover:border-rose-500/50',
    },
    {
      label: 'SEV-1 Incident',
      type: 'INCIDENT',
      payload: { severity: 'SEV-1' },
      icon: Flame,
      color: 'text-rose-400',
      border: 'hover:border-rose-500/50',
    },
    {
      label: 'Git Commit',
      type: 'ACTIVITY',
      payload: { actionType: 'COMMIT' },
      icon: GitCommit,
      color: 'text-cyan-400',
      border: 'hover:border-cyan-500/50',
    },
    {
      label: 'Latency Spike',
      type: 'LATENCY_SPIKE',
      payload: { latencyMs: 380 },
      icon: TrendingUp,
      color: 'text-amber-400',
      border: 'hover:border-amber-500/50',
    },
  ];

  return (
    <div className="rounded-xl bg-slate-900/40 border border-slate-800/80 p-3.5 backdrop-blur-sm shadow-md">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="p-1.5 rounded-lg bg-indigo-950/60 border border-indigo-800/40 text-indigo-400">
            <Zap className="w-4 h-4" />
          </span>
          <div>
            <span className="text-xs font-semibold text-white block">
              Event Processing Simulator
            </span>
            <span className="text-[11px] text-slate-400">
              Inject telemetry events into Redis Pub/Sub & WebSockets in real time
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {actions.map((act) => {
            const Icon = act.icon;
            return (
              <button
                key={act.label}
                onClick={() => onSimulate(act.type, act.payload)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs font-medium text-slate-200 transition-all ${act.border} active:scale-95`}
              >
                <Icon className={`w-3.5 h-3.5 ${act.color}`} />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
