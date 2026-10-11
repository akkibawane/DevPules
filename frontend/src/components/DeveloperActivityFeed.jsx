import React from 'react';
import { 
  GitCommit, 
  GitPullRequest, 
  GitMerge, 
  MessageSquareCode, 
  Users,
  Code
} from 'lucide-react';

export default function DeveloperActivityFeed({ activities = [] }) {
  const getActionIcon = (actionType) => {
    switch (actionType) {
      case 'COMMIT':
        return <GitCommit className="w-3.5 h-3.5 text-cyan-400" />;
      case 'PR_MERGED':
        return <GitMerge className="w-3.5 h-3.5 text-purple-400" />;
      case 'PR_OPEN':
        return <GitPullRequest className="w-3.5 h-3.5 text-emerald-400" />;
      case 'CODE_REVIEW':
        return <MessageSquareCode className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Code className="w-3.5 h-3.5 text-indigo-400" />;
    }
  };

  const getActionLabel = (actionType) => {
    switch (actionType) {
      case 'COMMIT':
        return 'pushed commit to';
      case 'PR_MERGED':
        return 'merged PR into';
      case 'PR_OPEN':
        return 'opened pull request in';
      case 'CODE_REVIEW':
        return 'approved PR in';
      default:
        return 'contributed to';
    }
  };

  return (
    <div className="rounded-xl bg-slate-900/60 border border-slate-800/80 p-5 backdrop-blur-sm shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-cyan-400" />
            Live Developer Stream
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time GitHub commit & PR activity feed
          </p>
        </div>
        <span className="text-xs font-mono text-slate-500">Auto-streaming</span>
      </div>

      <div className="mt-4 space-y-3">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-xs">
            No developer activity yet.
          </div>
        ) : (
          activities.slice(0, 6).map((act, idx) => (
            <div
              key={act.id || idx}
              className="flex items-start gap-3 p-2.5 rounded-lg bg-slate-950/30 border border-slate-850 hover:border-slate-750 transition-all text-xs"
            >
              {/* Avatar / initials */}
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 p-[1px] flex-shrink-0 mt-0.5">
                <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center font-bold text-[10px] text-white">
                  {act.developerName ? act.developerName.substring(0, 2).toUpperCase() : 'DV'}
                </div>
              </div>

              {/* Action content */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 text-slate-300">
                  <span className="font-semibold text-slate-100">{act.developerName}</span>
                  <span className="text-slate-500">{getActionLabel(act.actionType)}</span>
                  <span className="font-mono text-[11px] text-indigo-400 bg-indigo-950/50 px-1.5 py-0.2 rounded border border-indigo-800/40 truncate max-w-[140px]">
                    {act.repository}
                  </span>
                </div>
                <p className="text-slate-400 font-mono text-[11px] mt-1 truncate">
                  "{act.message}"
                </p>
              </div>

              {/* Timestamp & Icon */}
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className="p-1 rounded bg-slate-900 border border-slate-800">
                  {getActionIcon(act.actionType)}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {act.timeAgo || 'just now'}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
