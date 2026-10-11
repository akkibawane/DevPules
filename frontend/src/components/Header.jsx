import React from 'react';
import { 
  Activity, 
  Radio, 
  Database, 
  Flame, 
  Play, 
  GitBranch, 
  Server, 
  RefreshCw,
  Zap
} from 'lucide-react';

export default function Header({ 
  connectionStatus, 
  redisStatus, 
  onSimulate, 
  autoSimulate, 
  setAutoSimulate,
  selectedEnv,
  setSelectedEnv
}) {
  return (
    <header className="border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md sticky top-0 z-50 px-4 lg:px-8 py-3.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-cyan-500 to-emerald-400 p-[1px] shadow-lg shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Activity className="w-5 h-5 text-cyan-400" />
            </div>
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                DevPulse
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.4 LTS
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Real-time Developer Productivity & Engineering Intelligence
            </p>
          </div>
        </div>

        {/* Center: System Status Indicators */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
          {/* WebSocket Status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all ${
            connectionStatus === 'CONNECTED' 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/60 shadow-sm shadow-emerald-900/30' 
              : 'bg-amber-950/40 text-amber-400 border-amber-800/60 animate-pulse'
          }`}>
            <Radio className="w-3.5 h-3.5" />
            <span>WS: {connectionStatus}</span>
          </div>

          {/* Redis Status */}
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
            redisStatus === 'ONLINE' || redisStatus === 'EMBEDDED'
              ? 'bg-rose-950/40 text-rose-300 border-rose-800/50 shadow-sm shadow-rose-900/30'
              : 'bg-slate-900 text-slate-400 border-slate-800'
          }`}>
            <Database className="w-3.5 h-3.5 text-rose-400" />
            <span>REDIS: {redisStatus}</span>
          </div>

          {/* Environment Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {['production', 'staging', 'canary'].map((env) => (
              <button
                key={env}
                onClick={() => setSelectedEnv(env)}
                className={`px-2.5 py-0.5 rounded text-[11px] capitalize transition-all ${
                  selectedEnv === env 
                    ? 'bg-indigo-600 text-white font-semibold shadow' 
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {env}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Interactive Simulator Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSimulate('DEPLOY')}
            title="Deploy a microservice to production"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-slate-900 hover:bg-slate-850 hover:border-indigo-500/50 border border-slate-800 text-slate-200 rounded-lg transition-all shadow-sm active:scale-95"
          >
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simulate Deploy</span>
          </button>

          <button
            onClick={() => onSimulate('BUILD')}
            title="Trigger CI/CD Pipeline build"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-slate-900 hover:bg-slate-850 hover:border-emerald-500/50 border border-slate-800 text-slate-200 rounded-lg transition-all shadow-sm active:scale-95"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Run Pipeline</span>
          </button>

          <button
            onClick={() => onSimulate('INCIDENT')}
            title="Trigger mock SEV-1 production alert"
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-200 rounded-lg transition-all shadow-sm active:scale-95"
          >
            <Flame className="w-3.5 h-3.5 text-rose-400" />
            <span>Trigger SEV-1</span>
          </button>

          <button
            onClick={() => setAutoSimulate(!autoSimulate)}
            title="Toggle autonomous background event generator"
            className={`flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 border rounded-lg transition-all ${
              autoSimulate 
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${autoSimulate ? 'text-amber-400 animate-pulse' : ''}`} />
            <span>{autoSimulate ? 'Live Feed ON' : 'Paused'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
