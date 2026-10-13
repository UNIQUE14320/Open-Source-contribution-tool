import React, { useState, useEffect } from 'react';
import { GitPullRequest, GitBranch, Check, Terminal as TerminalIcon, Sparkles, Send, Copy, ArrowRight, ExternalLink } from 'lucide-react';
import { CliConfig, GitHubPullRequest } from '../types';
import { submitPullRequest } from '../services/githubApi';

interface PrAutomationWizardProps {
  config: CliConfig;
  initialIssueNumber?: number;
  initialIssueTitle?: string;
  onRunInTerminal: (command: string) => void;
  onClearInitialIssue: () => void;
}

export const PrAutomationWizard: React.FC<PrAutomationWizardProps> = ({
  config,
  initialIssueNumber,
  initialIssueTitle,
  onRunInTerminal,
  onClearInitialIssue,
}) => {
  const [commitType, setCommitType] = useState('fix');
  const [scope, setScope] = useState('compiler');
  const [shortDesc, setShortDesc] = useState('');
  const [linkedIssue, setLinkedIssue] = useState<number | undefined>(initialIssueNumber);
  const [baseBranch, setBaseBranch] = useState('main');
  const [headBranch, setHeadBranch] = useState('');
  const [templateType, setTemplateType] = useState<'bugfix' | 'feature' | 'docs'>('bugfix');
  const [customNotes, setCustomNotes] = useState('');
  const [isDraft, setIsDraft] = useState(false);
  const [submittedPr, setSubmittedPr] = useState<GitHubPullRequest | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState(false);

  // Sync when an issue is selected from IssueTracker
  useEffect(() => {
    if (initialIssueNumber) {
      setLinkedIssue(initialIssueNumber);
      if (initialIssueTitle) {
        const cleaned = initialIssueTitle.replace(/^(fix|feat|docs|refactor)(\([^)]+\))?:\s*/i, '');
        setShortDesc(cleaned);
        const slug = cleaned.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24);
        setHeadBranch(`fix/issue-${initialIssueNumber}-${slug}`);
      } else {
        setHeadBranch(`fix/issue-${initialIssueNumber}-solution`);
      }
    }
  }, [initialIssueNumber, initialIssueTitle]);

  const computedTitle = scope
    ? `${commitType}(${scope}): ${shortDesc || 'resolve issue'}`
    : `${commitType}: ${shortDesc || 'resolve issue'}`;

  const computedBranch = headBranch || (linkedIssue ? `fix/issue-${linkedIssue}-patch` : 'feature/contribution');

  const computedMarkdownBody = `## Description
${customNotes || 'Automated contribution prepared and verified with GitContrib CLI.'}

${linkedIssue ? `## Related Issue\nFixes #${linkedIssue}\n` : ''}
## Checklist
- [x] Code adheres to the repository's style guidelines
- [x] Unit tests added/updated and passing
- [x] Relevant documentation updated
${templateType === 'bugfix' ? '- [x] Verified bug reproduction before patch' : ''}
${templateType === 'feature' ? '- [x] Architecture matches OSS project specifications' : ''}

---
*Generated with GitContrib CLI (Java / Picocli / Jackson REST)*`;

  const computedCliCommand = `gitcontrib pr submit --repo ${config.defaultRepo} --title "${computedTitle}" --head "${computedBranch}" --base "${baseBranch}"${
    linkedIssue ? ` --issue ${linkedIssue}` : ''
  }${isDraft ? ' --draft' : ''} --template ${templateType}`;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitPullRequest(
        config.defaultRepo,
        computedTitle,
        computedMarkdownBody,
        computedBranch,
        baseBranch,
        isDraft,
        config.githubToken
      );
      setSubmittedPr(result.pr);
    } catch (e: any) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(computedCliCommand);
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h1 className="text-xl font-bold text-white">Pull Request Automation Wizard</h1>
            <p className="text-xs text-slate-400 mt-1">
              Assemble Conventional Commits, auto-link issues, populate markdown checklists, and submit via GitHub REST API.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onRunInTerminal(computedCliCommand)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors cursor-pointer"
            >
              <TerminalIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Send to CLI Terminal</span>
            </button>
          </div>
        </div>

        {/* Success Modal / Banner if PR Submitted */}
        {submittedPr && (
          <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                <Check className="w-4 h-4" />
                <span>Pull Request #{submittedPr.number} Successfully Created!</span>
              </div>
              <a
                href={submittedPr.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-emerald-300 hover:underline"
              >
                <span>View on GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-xs text-slate-300">
              Target: <strong className="text-white">{config.defaultRepo}</strong> ({baseBranch} &larr; {computedBranch}) · Status: {isDraft ? 'Draft' : 'Open for review'}
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onRunInTerminal(`gitcontrib pr checks ${submittedPr.number} --repo ${config.defaultRepo}`)}
                className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold rounded transition-colors cursor-pointer"
              >
                Run CI Checks in Terminal
              </button>
              <button
                onClick={() => setSubmittedPr(null)}
                className="px-3 py-1 text-slate-400 hover:text-white text-xs cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* 2-Column Form & Live Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Form Controls */}
          <div className="lg:col-span-7 space-y-5">
            {/* Step 1: Target Repository & Branching */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-cyan-400" />
                <span>1. Repository & Branching Configuration</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Upstream Target Repo</label>
                  <input
                    type="text"
                    disabled
                    value={config.defaultRepo}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Target Base Branch</label>
                  <input
                    type="text"
                    value={baseBranch}
                    onChange={(e) => setBaseBranch(e.target.value)}
                    placeholder="main"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Contributor Head Branch</label>
                  <input
                    type="text"
                    value={headBranch}
                    onChange={(e) => setHeadBranch(e.target.value)}
                    placeholder="fix/issue-28140-slug"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Link Issue # (Optional)</label>
                  <input
                    type="number"
                    value={linkedIssue || ''}
                    onChange={(e) => setLinkedIssue(e.target.value ? parseInt(e.target.value, 10) : undefined)}
                    placeholder="e.g. 28140"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Conventional Commits Title Generator */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>2. Conventional Commits PR Title</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Type</label>
                  <select
                    value={commitType}
                    onChange={(e) => setCommitType(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    <option value="fix">fix (Bug fix)</option>
                    <option value="feat">feat (New feature)</option>
                    <option value="docs">docs (Documentation)</option>
                    <option value="refactor">refactor (Code structure)</option>
                    <option value="test">test (Adding tests)</option>
                    <option value="perf">perf (Performance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Scope (Optional)</label>
                  <input
                    type="text"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    placeholder="compiler, hooks, cli"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-slate-400 mb-1">Draft PR</label>
                  <label className="flex items-center gap-2 mt-1 text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isDraft}
                      onChange={(e) => setIsDraft(e.target.checked)}
                      className="rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-0"
                    />
                    <span>Open as Draft</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Short Description</label>
                <input
                  type="text"
                  value={shortDesc}
                  onChange={(e) => setShortDesc(e.target.value)}
                  placeholder="e.g. reconcile memo cache slot for ternary JSX expressions"
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                <span className="text-slate-500 font-mono">Generated Title: </span>
                <span className="text-cyan-300 font-mono font-semibold">{computedTitle}</span>
              </div>
            </div>

            {/* Step 3: Template & Markdown Body */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">3. PR Template & Description</h2>
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
                  <button
                    onClick={() => setTemplateType('bugfix')}
                    className={`px-2.5 py-0.5 rounded cursor-pointer ${
                      templateType === 'bugfix' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    Bug Fix
                  </button>
                  <button
                    onClick={() => setTemplateType('feature')}
                    className={`px-2.5 py-0.5 rounded cursor-pointer ${
                      templateType === 'feature' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    Feature
                  </button>
                  <button
                    onClick={() => setTemplateType('docs')}
                    className={`px-2.5 py-0.5 rounded cursor-pointer ${
                      templateType === 'docs' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-slate-400'
                    }`}
                  >
                    Docs
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Custom Notes / Context</label>
                <textarea
                  rows={3}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="Explain the problem and why this fix is correct..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Output & Command Preview */}
          <div className="lg:col-span-5 space-y-5">
            {/* Picocli Terminal Command Preview */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-300">Equivalent Picocli Command</span>
                <button
                  onClick={handleCopyCommand}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedCmd ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCmd ? 'Copied' : 'Copy'}</span>
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 break-all leading-relaxed select-all">
                {computedCliCommand}
              </div>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="animate-spin text-sm">⟳</span>
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Submit Pull Request (REST API)</span>
              </button>
            </div>

            {/* Markdown Preview */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <span className="text-xs font-semibold text-slate-300">Generated PR Markdown Body</span>
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
                {computedMarkdownBody}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
