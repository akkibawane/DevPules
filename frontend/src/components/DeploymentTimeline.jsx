import React from 'react';
import { 
  Server, 
  RotateCcw, 
  Check, 
  AlertOctagon, 
  ArrowUpRight,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export default function DeploymentTimeline({ deployments = [], onRollback }) {
  const getEnvBadge = (env) => {
    switch (env) {
      case 'production':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/60';
      case 'staging':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/60';
      case 'canary':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/60';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
      case 'DEPLOYED':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
            <Check className="w-3.5 h-3.5" /> Deployed
          </span>
        );
      case 'IN_PROGRESS':
      case 'DEPLOYING':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-400 animate-pulse">
            <Cpu className="w-3.5 h-3.5 animate-spin" /> Deploying
          </span>
        );
      case 'ROLLED_BACK':
        return (
          <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400">
            <RotateCcw className="w-3.5 h-3.5" /> Rolled Back
          </span>
        );
      default:
        return <span className="text-[11px] font-mono text-slate-400">{status}</span>;
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 backdrop-blur-sm shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Server className="w-4 h-4 text-purple-400" />
            Microservice Deployments
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Production & staging release history across cluster
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500">Live Canary/Prod</span>
      </div>

      <div className="mt-4 space-y-3">
        {deployments.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No deployments recorded yet.
          </div>
        ) : (
          deployments.slice(0, 5).map((deploy, idx) => (
            <div
              key={deploy.id || idx}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-slate-950/40 border border-slate-800/60 hover:border-slate-700 transition-all"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-purple-400">
                  <Server className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-slate-100">
                      {deploy.serviceName}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium border uppercase ${getEnvBadge(deploy.environment)}`}>
                      {deploy.environment}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      v{deploy.version || '1.8.2'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span>by {deploy.deployedBy || 'ci-bot'}</span>
                    <span>•</span>
                    <span className="font-mono text-[11px] text-slate-400">
                      commit {deploy.commitHash ? deploy.commitHash.substring(0, 7) : 'a4b83f1'}
                    </span>
                    <span>•</span>
                    <span>{deploy.timeAgo || '3m ago'}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/60">
                {getStatusBadge(deploy.status)}
                
                {deploy.status !== 'ROLLED_BACK' && (
                  <button
                    onClick={() => onRollback && onRollback(deploy.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-rose-950/50 hover:text-rose-300 hover:border-rose-800/50 border border-slate-800 text-[11px] text-slate-400 transition-all"
                    title="Instant zero-downtime rollback"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Rollback
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
