import React, { useState, useEffect, useRef } from 'react';
import { CircleDot, Search, GitBranch, GitPullRequest, ExternalLink, MessageSquare, ArrowRight, Check, Code, RefreshCw } from 'lucide-react';
import { CliConfig, GitHubIssue } from '../types';
import { fetchIssues } from '../services/githubApi';

interface IssueTrackerProps {
  config: CliConfig;
  onRunCommandInTerminal: (command: string) => void;
  onOpenPrWizard: (issueNumber: number, title: string) => void;
  focusTrigger?: number;
}

export const IssueTracker: React.FC<IssueTrackerProps> = ({
  config,
  onRunCommandInTerminal,
  onOpenPrWizard,
  focusTrigger,
}) => {
  const [issues, setIssues] = useState<GitHubIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState<'all' | 'good-first-issue' | 'help-wanted' | 'bug'>('all');
  const [selectedIssue, setSelectedIssue] = useState<GitHubIssue | null>(null);
  const [claimedIssues, setClaimedIssues] = useState<number[]>([]);
  const [dataSource, setDataSource] = useState<'live' | 'sandbox'>('sandbox');
  const [apiError, setApiError] = useState<string | null>(null);

  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchRef.current?.focus();
  }, [focusTrigger]);

  const loadIssues = async () => {
    setLoading(true);
    setApiError(null);
    try {
      const labelParam = filterTag === 'all' ? undefined : filterTag.replace(/-/g, ' ');
      const result = await fetchIssues(config.defaultRepo, 'open', labelParam, config.githubToken, !config.useLiveApi);
      setIssues(result.data.filter((i) => !i.pull_request));
      setDataSource(result.source);
      if (result.error) setApiError(result.error);
    } catch (e: any) {
      setApiError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [config.defaultRepo, config.useLiveApi, config.githubToken, filterTag]);

  const filteredIssues = issues.filter((i) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      i.title.toLowerCase().includes(q) ||
      i.number.toString().includes(q) ||
      i.labels.some((l) => l.name.toLowerCase().includes(q))
    );
  });

  const handleClaim = (issue: GitHubIssue) => {
    const slug = issue.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
    const cmd = `gitcontrib issue claim ${issue.number} --branch fix/issue-${issue.number}-${slug}`;
    setClaimedIssues((prev) => [...prev, issue.number]);
    onRunCommandInTerminal(cmd);
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] bg-slate-950 overflow-hidden">
      {/* Subheader Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-3.5 bg-slate-900 border-b border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white">Open Source Issue Tracker</h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
            <span>Repository: <strong className="text-slate-200">{config.defaultRepo}</strong></span>
            <span>·</span>
            <span>Mode: {dataSource === 'live' ? 'Live GitHub REST API' : 'Interactive Sandbox'}</span>
            <span>·</span>
            <span className="tabular-nums">{filteredIssues.length} issues</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by keyword or #number... (Ctrl+I)"
              className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 w-56"
            />
          </div>

          <button
            onClick={loadIssues}
            disabled={loading}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title="Refresh issues"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 py-2 bg-slate-900/40 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 text-xs">Filter:</span>
        <button
          onClick={() => setFilterTag('all')}
          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
            filterTag === 'all'
              ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All Issues
        </button>
        <button
          onClick={() => setFilterTag('good-first-issue')}
          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
            filterTag === 'good-first-issue'
              ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Good First Issue
        </button>
        <button
          onClick={() => setFilterTag('help-wanted')}
          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
            filterTag === 'help-wanted'
              ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Help Wanted
        </button>
        <button
          onClick={() => setFilterTag('bug')}
          className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
            filterTag === 'bug'
              ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Bugs
        </button>
      </div>

      {apiError && (
        <div className="px-6 py-2 bg-amber-950/30 border-b border-amber-900/50 text-xs text-amber-300">
          {apiError}
        </div>
      )}

      {/* Main Split Layout: Issue List & Details Drawer */}
      <div className="flex-1 flex overflow-hidden">
        {/* Issue Cards Column */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="p-4 rounded-lg bg-slate-900/60 border border-slate-800 animate-pulse h-24" />
              ))}
            </div>
          ) : filteredIssues.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm">
              <CircleDot className="w-8 h-8 mx-auto mb-2 text-slate-600" />
              <p>No issues found for this query.</p>
              <button
                onClick={() => {
                  setFilterTag('all');
                  setSearchQuery('');
                }}
                className="mt-3 text-xs text-cyan-400 hover:underline cursor-pointer"
              >
                Reset filters
              </button>
            </div>
          ) : (
            filteredIssues.map((issue) => {
              const isClaimed = claimedIssues.includes(issue.number);
              const isSelected = selectedIssue?.id === issue.id;

              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 border-cyan-500/50 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      {/* Title */}
                      <h2 className="text-sm font-semibold text-white leading-snug hover:text-cyan-300 transition-colors">
                        <span className="text-emerald-400 font-mono mr-2">#{issue.number}</span>
                        {issue.title}
                      </h2>

                      {/* Zero-Pill Clean Metadata */}
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mt-2">
                        <span>by {issue.user?.login}</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(issue.created_at).toLocaleDateString()}</span>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3 text-slate-500" />
                          <span className="tabular-nums">{issue.comments} comments</span>
                        </span>
                        {issue.labels.length > 0 && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-300 font-medium">
                              {issue.labels.map((l) => l.name).join(', ')}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      {isClaimed ? (
                        <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium px-2 py-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Claimed</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => handleClaim(issue)}
                          title="Run 'gitcontrib issue claim' in terminal"
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition-colors cursor-pointer"
                        >
                          <GitBranch className="w-3 h-3 text-cyan-400" />
                          <span>Claim & Branch</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenPrWizard(issue.number, issue.title)}
                        title="Open Pull Request for this issue"
                        className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded transition-colors cursor-pointer"
                      >
                        <GitPullRequest className="w-3 h-3" />
                        <span>Submit PR</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Issue Preview Panel */}
        <div className="w-96 border-l border-slate-800 bg-slate-900/60 p-6 flex flex-col overflow-y-auto hidden md:flex">
          {selectedIssue ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  Issue #{selectedIssue.number}
                </span>
                <a
                  href={selectedIssue.html_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <span>Open in GitHub</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <h2 className="text-base font-bold text-white leading-tight">{selectedIssue.title}</h2>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-slate-400">Equivalent Picocli Command:</div>
                <div className="text-cyan-300 break-all select-all">
                  gitcontrib issue view {selectedIssue.number} --repo {config.defaultRepo}
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                  Description
                </h3>
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {selectedIssue.body || 'No description provided.'}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 space-y-2">
                <button
                  onClick={() => handleClaim(selectedIssue)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Execute Claim via CLI</span>
                </button>

                <button
                  onClick={() => onOpenPrWizard(selectedIssue.number, selectedIssue.title)}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-cyan-400 hover:bg-cyan-300 text-slate-950 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  <GitPullRequest className="w-3.5 h-3.5" />
                  <span>Open Pull Request Automator</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
              <CircleDot className="w-8 h-8 mb-2 text-slate-600" />
              <p>Select any issue on the left to preview details, markdown body, and Picocli automation commands.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
