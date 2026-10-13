import React, { useState } from 'react';
import { X, Save, Key, GitFork, ShieldCheck, HelpCircle } from 'lucide-react';
import { CliConfig } from '../types';

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: CliConfig;
  onSave: (newConfig: Partial<CliConfig>) => void;
}

export const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [repo, setRepo] = useState(config.defaultRepo);
  const [token, setToken] = useState(config.githubToken);
  const [authorName, setAuthorName] = useState(config.authorName);
  const [authorEmail, setAuthorEmail] = useState(config.authorEmail);
  const [useLiveApi, setUseLiveApi] = useState(config.useLiveApi);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      defaultRepo: repo.trim() || 'facebook/react',
      githubToken: token.trim(),
      authorName: authorName.trim(),
      authorEmail: authorEmail.trim(),
      useLiveApi
    });
    onClose();
  };

  const sampleRepos = [
    'facebook/react',
    'spring-projects/spring-boot',
    'pallets/flask',
    'tailwindlabs/tailwindcss',
    'octocat/Hello-World'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">CLI Configuration (~/.gitcontrib/config.json)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 text-xs text-slate-300">
          {/* Target Repo */}
          <div className="space-y-1.5">
            <label className="block font-semibold text-slate-200">Default Target Repository (owner/repo)</label>
            <input
              type="text"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              placeholder="e.g. facebook/react"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px] text-slate-500">
              <span>Quick presets:</span>
              {sampleRepos.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRepo(r)}
                  className="text-cyan-400 hover:underline cursor-pointer"
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* API Mode */}
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-semibold text-slate-200">REST API Execution Mode</span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setUseLiveApi(true)}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  useLiveApi
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold">Live GitHub API</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Fetches directly from api.github.com</div>
              </button>

              <button
                type="button"
                onClick={() => setUseLiveApi(false)}
                className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                  !useLiveApi
                    ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="font-semibold">Demo Sandbox</div>
                <div className="text-[11px] text-slate-400 mt-0.5">Zero rate-limits & simulated PRs</div>
              </button>
            </div>
          </div>

          {/* Personal Access Token */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-200">GitHub Personal Access Token (PAT) (Optional)</label>
              <span className="text-[11px] text-slate-500">Stored locally in browser</span>
            </div>
            <input
              type="password"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono focus:outline-none focus:border-cyan-400"
            />
            <p className="text-[11px] text-slate-500">
              Needed only if you hit the 60 req/hr public rate limit or wish to submit actual Pull Requests to GitHub repositories.
            </p>
          </div>

          {/* Author info for Conventional Commits */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Git Author Name</label>
              <input
                type="text"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Ada Lovelace"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-200 mb-1">Git Author Email</label>
              <input
                type="email"
                value={authorEmail}
                onChange={(e) => setAuthorEmail(e.target.value)}
                placeholder="ada@example.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-400"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-3 bg-slate-950 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
};
