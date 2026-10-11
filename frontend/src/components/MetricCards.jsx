import React from 'react';
import { 
  CheckCircle2, 
  Rocket, 
  AlertTriangle, 
  HeartPulse, 
  TrendingUp, 
  TrendingDown, 
  Clock,
  Gauge
} from 'lucide-react';

export default function MetricCards({ metrics = {} }) {
  const {
    buildSuccessRate = 96.4,
    totalBuilds24h = 84,
    failedBuilds24h = 3,
    deploysToday = 14,
    avgLeadTimeMinutes = 18,
    activeIncidents = 1,
    mttrMinutes = 24,
    apiUptime = 99.92,
    avgLatencyMs = 42
  } = metrics;

  const cards = [
    {
      title: 'CI/CD Build Success',
      value: `${buildSuccessRate.toFixed(1)}%`,
      subtitle: `${totalBuilds24h - failedBuilds24h} passing · ${failedBuilds24h} failed (24h)`,
      trend: '+2.1% vs last week',
      trendUp: true,
      icon: CheckCircle2,
      accent: 'emerald',
      gradient: 'from-emerald-500/10 to-transparent',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    },
    {
      title: 'Deployment Velocity',
      value: `${deploysToday} deploys`,
      subtitle: `Avg lead time: ${avgLeadTimeMinutes}m to production`,
      trend: '+4 deploys today',
      trendUp: true,
      icon: Rocket,
      accent: 'cyan',
      gradient: 'from-cyan-500/10 to-transparent',
      borderColor: 'border-cyan-500/20',
      iconColor: 'text-cyan-400',
      badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    },
    {
      title: 'Production Incidents',
      value: `${activeIncidents} Active`,
      subtitle: `MTTR: ${mttrMinutes}m · 0 Sev-1 breaches`,
      trend: activeIncidents > 0 ? 'Action needed' : 'All clear',
      trendUp: activeIncidents === 0,
      icon: AlertTriangle,
      accent: activeIncidents > 0 ? 'amber' : 'emerald',
      gradient: activeIncidents > 0 ? 'from-amber-500/10 to-transparent' : 'from-emerald-500/10 to-transparent',
      borderColor: activeIncidents > 0 ? 'border-amber-500/30' : 'border-emerald-500/20',
      iconColor: activeIncidents > 0 ? 'text-amber-400' : 'text-emerald-400',
      badgeBg: activeIncidents > 0 ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    },
    {
      title: 'API Reliability & Latency',
      value: `${apiUptime.toFixed(2)}%`,
      subtitle: `Avg latency: ${avgLatencyMs}ms · 5 microservices`,
      trend: 'P99: 110ms',
      trendUp: true,
      icon: HeartPulse,
      accent: 'indigo',
      gradient: 'from-indigo-500/10 to-transparent',
      borderColor: 'border-indigo-500/20',
      iconColor: 'text-indigo-400',
      badgeBg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-xl bg-slate-900/60 border ${card.borderColor} p-5 backdrop-blur-sm shadow-md transition-all hover:border-slate-700 hover:shadow-lg`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${card.gradient} rounded-bl-full pointer-events-none`} />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                  {card.title}
                </p>
                <div className="text-2xl font-extrabold text-white tracking-tight">
                  {card.value}
                </div>
              </div>
              <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60 ${card.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-slate-400 font-medium">
                {card.subtitle}
              </span>
              <span className={`px-2 py-0.5 rounded-md font-mono text-[11px] border ${card.badgeBg}`}>
                {card.trend}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
