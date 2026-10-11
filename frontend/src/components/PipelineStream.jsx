import React, { useState } from 'react';
import { 
  GitPullRequest, 
  GitCommit, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  ExternalLink,
  ChevronRight,
  Filter
} from 'lucide-react';

export default function PipelineStream({ builds = [] }) {
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'GITHUB' | 'JENKINS'
  const [selectedBuild, setSelectedBuild] = useState(null);

  const filteredBuilds = builds.filter(b => {
    if (filter === 'ALL') return true;
    return (b.source || 'GITHUB').toUpperCase() === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <CheckCircle className="w-3.5 h-3.5" />
            Passed
          </span>
        );
      case 'FAILURE':
      case 'FAILED':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-950/60 text-rose-400 border border-rose-800/60">
            <XCircle className="w-3.5 h-3.5" />
            Failed
          </span>
        );
      case 'RUNNING':
        return (
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Running
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  const stages = ['Lint', 'Unit Test', 'Docker Build', 'Security Scan', 'Deploy'];

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 backdrop-blur-sm shadow-md">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              CI/CD Pipeline Stream
            </h2>
            <span className="text-xs font-mono px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700">
              {filteredBuilds.length} runs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time GitHub Actions & Jenkins pipeline telemetry
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-lg border border-slate-800/80 text-xs">
          <Filter className="w-3.5 h-3.5 text-slate-500 ml-1.5 mr-0.5" />
          {['ALL', 'GITHUB', 'JENKINS'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                filter === f 
                  ? 'bg-indigo-600 text-white shadow' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Builds List */}
      <div className="mt-4 space-y-3">
        {filteredBuilds.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No pipeline events recorded yet. Trigger a build from the top bar!
          </div>
        ) : (
          filteredBuilds.slice(0, 5).map((build) => (
            <div
              key={build.id || build.commitHash + build.pipelineName}
              onClick={() => setSelectedBuild(build)}
              className="group cursor-pointer rounded-lg bg-slate-950/50 border border-slate-800/70 p-3.5 hover:border-indigo-500/50 hover:bg-slate-950/80 transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left: Info */}
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 px-2 py-1 rounded text-[10px] font-mono font-bold uppercase border ${
                    build.source === 'JENKINS' 
                      ? 'bg-amber-950/50 text-amber-300 border-amber-800/40' 
                      : 'bg-indigo-950/50 text-indigo-300 border-indigo-800/40'
                  }`}>
                    {build.source || 'GITHUB'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-slate-100 group-hover:text-indigo-400 transition-colors">
                        {build.pipelineName}
                      </span>
                      <span className="text-xs text-slate-500">#{build.buildNumber || '142'}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                      <span className="flex items-center gap-1 font-mono text-[11px] text-cyan-300/90">
                        <GitPullRequest className="w-3 h-3 text-cyan-400" />
                        {build.branch || 'main'}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                        <GitCommit className="w-3 h-3 text-slate-500" />
                        {build.commitHash ? build.commitHash.substring(0, 7) : '8f92a1d'}
                      </span>
                      <span className="text-slate-400">
                        by <strong className="text-slate-300 font-medium">{build.author || 'alex-dev'}</strong>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500 font-mono text-[11px]">
                        <Clock className="w-3 h-3" />
                        {build.durationSeconds ? `${build.durationSeconds}s` : '1m 24s'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Stages & Status */}
                <div className="flex items-center gap-4">
                  {/* Stages indicator */}
                  <div className="hidden lg:flex items-center gap-1.5 text-[10px] font-mono">
                    {stages.map((stage, sIdx) => {
                      const isFailed = build.status === 'FAILED' && sIdx === 3;
                      const isCompleted = build.status === 'SUCCESS' || (build.status === 'RUNNING' && sIdx < 2);
                      const isCurrent = build.status === 'RUNNING' && sIdx === 2;

                      return (
                        <div
                          key={stage}
                          className={`px-2 py-0.5 rounded border ${
                            isFailed
                              ? 'bg-rose-950/60 text-rose-300 border-rose-800/60'
                              : isCompleted
                              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                              : isCurrent
                              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-700 animate-pulse'
                              : 'bg-slate-900 text-slate-600 border-slate-800'
                          }`}
                        >
                          {stage}
                        </div>
                      );
                    })}
                  </div>

                  {getStatusBadge(build.status)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Build details modal / preview */}
      {selectedBuild && (
        <div className="mt-4 p-4 rounded-lg bg-slate-950 border border-indigo-500/40 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-semibold text-slate-200">
              Build Logs: {selectedBuild.pipelineName} #{selectedBuild.buildNumber || '142'}
            </span>
            <button 
              onClick={() => setSelectedBuild(null)}
              className="text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>
          <pre className="mt-2 text-slate-400 font-mono text-[11px] p-2 bg-slate-900 rounded overflow-x-auto">
{`[INFO] Checking out ${selectedBuild.branch || 'main'} @ ${selectedBuild.commitHash || '8f92a1d'}
[INFO] Running static analysis & lint checks... PASSED (0 errors)
[INFO] Executing JUnit 5 unit & integration test suites (128 tests)...
[INFO] Tests run: 128, Failures: ${selectedBuild.status === 'FAILED' ? 1 : 0}, Errors: 0, Skipped: 0
${selectedBuild.status === 'FAILED' ? '[ERROR] PaymentGatewayTimeoutException: Connection refused in PaymentServiceTest.java:54' : '[INFO] BUILD SUCCESS - Finished in 42s'}
[INFO] Redis Cache push: devpulse.pipeline.${selectedBuild.pipelineName} updated`}
          </pre>
        </div>
      )}
    </div>
  );
}
