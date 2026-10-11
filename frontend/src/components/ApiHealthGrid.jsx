import React from 'react';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowUp, 
  ArrowDown 
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

export default function ApiHealthGrid({ services = [], latencyHistory = [] }) {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'HEALTHY':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'DEGRADED':
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      case 'DOWN':
        return <XCircle className="w-4 h-4 text-rose-400 animate-pulse" />;
      default:
        return <Activity className="w-4 h-4 text-slate-400" />;
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'HEALTHY':
        return 'text-emerald-400 bg-emerald-950/40 border-emerald-800/40';
      case 'DEGRADED':
        return 'text-amber-400 bg-amber-950/40 border-amber-800/40';
      case 'DOWN':
        return 'text-rose-400 bg-rose-950/40 border-rose-800/40';
      default:
        return 'text-slate-400 bg-slate-900 border-slate-800';
    }
  };

  // Default fallback data if empty
  const defaultHistory = latencyHistory.length > 0 ? latencyHistory : [
    { time: '01:00', gateway: 32, auth: 18, payment: 45 },
    { time: '01:05', gateway: 28, auth: 22, payment: 51 },
    { time: '01:10', gateway: 35, auth: 19, payment: 48 },
    { time: '01:15', gateway: 42, auth: 25, payment: 62 },
    { time: '01:20', gateway: 31, auth: 20, payment: 44 },
    { time: '01:25', gateway: 36, auth: 21, payment: 46 },
  ];

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 backdrop-blur-sm shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            API & Microservice Health
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time endpoint latencies and service availability
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> Gateway
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400"></span> Auth
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Payment
          </span>
        </div>
      </div>

      {/* Latency Area Chart */}
      <div className="h-44 mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={defaultHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="gatewayGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#34d399" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="authGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="paymentGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
            <YAxis stroke="#64748b" fontSize={10} tickLine={false} unit="ms" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#334155', 
                borderRadius: '8px', 
                fontSize: '11px',
                color: '#f8fafc' 
              }} 
            />
            <Area type="monotone" dataKey="gateway" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#gatewayGrad)" name="Gateway (ms)" />
            <Area type="monotone" dataKey="auth" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#authGrad)" name="Auth (ms)" />
            <Area type="monotone" dataKey="payment" stroke="#fbbf24" strokeWidth={2} fillOpacity={1} fill="url(#paymentGrad)" name="Payment (ms)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 mt-4">
        {services.map((svc) => (
          <div
            key={svc.name}
            className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-all"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-xs text-slate-200 truncate" title={svc.name}>
                {svc.name}
              </span>
              {getStatusIcon(svc.status)}
            </div>
            <div className="mt-2 flex items-baseline justify-between text-xs">
              <span className="font-mono text-[11px] text-slate-400">
                {svc.latencyMs}ms
              </span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono border ${getStatusBg(svc.status)}`}>
                {svc.uptime}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
