import React from 'react';
import { Download, Terminal as TerminalIcon, GitPullRequest, CircleDot, Code2, Network, Settings, Keyboard } from 'lucide-react';
import { downloadMavenProjectZip } from '../services/zipExporter';

interface HeaderProps {
  activeTab: 'terminal' | 'issues' | 'pr-wizard' | 'code' | 'api';
  setActiveTab: (tab: 'terminal' | 'issues' | 'pr-wizard' | 'code' | 'api') => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
  defaultRepo: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSettings,
  onOpenShortcuts,
  defaultRepo,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800 bg-slate-950 sticky top-0 z-40">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <a
          href="#"
          onClick={(e) => { e.preventDefault(); setActiveTab('terminal'); }}
          className="text-base font-bold tracking-tight text-white whitespace-nowrap hover:text-cyan-400 transition-colors"
        >
          GitContrib CLI
        </a>
        <span className="text-xs text-slate-500 hidden sm:inline">
          Java · Picocli · REST API · Maven
        </span>
      </div>

      {/* Zone 2: 4-5 clean single-line text navigation links with keyboard hints */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-400">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer ${
            activeTab === 'terminal' ? 'text-cyan-400 font-semibold' : ''
          }`}
          title="Terminal (Ctrl+K)"
        >
          <TerminalIcon className="w-4 h-4" />
          <span>CLI Terminal</span>
          <kbd className="hidden xl:inline text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-1 py-0.5 rounded">^K</kbd>
        </button>

        <button
          onClick={() => setActiveTab('issues')}
          className={`flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer ${
            activeTab === 'issues' ? 'text-cyan-400 font-semibold' : ''
          }`}
          title="Issue Tracker (Ctrl+I)"
        >
          <CircleDot className="w-4 h-4" />
          <span>Issue Tracker</span>
          <kbd className="hidden xl:inline text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-1 py-0.5 rounded">^I</kbd>
        </button>

        <button
          onClick={() => setActiveTab('pr-wizard')}
          className={`flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer ${
            activeTab === 'pr-wizard' ? 'text-cyan-400 font-semibold' : ''
          }`}
          title="PR Automator (Ctrl+P)"
        >
          <GitPullRequest className="w-4 h-4" />
          <span>PR Automator</span>
          <kbd className="hidden xl:inline text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-1 py-0.5 rounded">^P</kbd>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer ${
            activeTab === 'code' ? 'text-cyan-400 font-semibold' : ''
          }`}
          title="Maven Codebase (Ctrl+M)"
        >
          <Code2 className="w-4 h-4" />
          <span>Maven Codebase</span>
          <kbd className="hidden xl:inline text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-1 py-0.5 rounded">^M</kbd>
        </button>

        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-2 whitespace-nowrap hover:text-white transition-colors cursor-pointer ${
            activeTab === 'api' ? 'text-cyan-400 font-semibold' : ''
          }`}
          title="REST & Jackson (Ctrl+R)"
        >
          <Network className="w-4 h-4" />
          <span>REST & Jackson</span>
          <kbd className="hidden xl:inline text-[10px] text-slate-500 font-mono bg-slate-900 border border-slate-800 px-1 py-0.5 rounded">^R</kbd>
        </button>
      </nav>

      {/* Zone 3: 1 primary action and utility controls */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={onOpenShortcuts}
          title="Keyboard Shortcuts (Press ?)"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          title="Configure Repository & Token (Ctrl+,)"
          className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={() => downloadMavenProjectZip()}
          className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer ml-1"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download Maven ZIP</span>
        </button>
      </div>
    </header>
  );
};
