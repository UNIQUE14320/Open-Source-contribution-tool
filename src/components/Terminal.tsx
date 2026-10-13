import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft, Play, Trash2, Copy, Check, Sparkles } from 'lucide-react';
import { CliConfig, CommandLog } from '../types';
import { executePicocliCommand } from '../services/cliEngine';

interface TerminalProps {
  config: CliConfig;
  updateConfig: (patch: Partial<CliConfig>) => void;
  externalCommand?: string | null;
  onClearExternalCommand?: () => void;
  onSwitchToPrWizard?: (issueNumber: number, title: string) => void;
  focusTrigger?: number;
}

export const Terminal: React.FC<TerminalProps> = ({
  config,
  updateConfig,
  externalCommand,
  onClearExternalCommand,
  onSwitchToPrWizard,
  focusTrigger,
}) => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logs, setLogs] = useState<CommandLog[]>([
    {
      id: 'welcome',
      timestamp: new Date().toLocaleTimeString(),
      command: 'gitcontrib --version',
      output: `gitcontrib version 1.0.0 (Java 17 / Picocli 4.7.6 / Jackson REST Client / Maven)
Automated Open Source Contribution CLI.
Ready to query issues and automate pull request submissions.
Type 'gitcontrib --help' or select a preset command below to start.`,
      type: 'info'
    }
  ]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [logs]);

  useEffect(() => {
    inputRef.current?.focus();
  }, [focusTrigger]);

  // Handle external commands passed from other components (like clicking Claim or Run from Issue Tracker)
  useEffect(() => {
    if (externalCommand) {
      handleRun(externalCommand);
      onClearExternalCommand?.();
    }
  }, [externalCommand]);

  const handleRun = async (cmdToRun: string) => {
    const trimmed = cmdToRun.trim();
    if (!trimmed) return;

    setIsExecuting(true);
    setHistory((prev) => [...prev, trimmed]);
    setHistoryIndex(-1);

    const logId = Date.now().toString();

    // Check if clear command
    if (trimmed.toLowerCase() === 'clear' || trimmed.toLowerCase() === 'gitcontrib clear') {
      setLogs([]);
      setIsExecuting(false);
      setInput('');
      return;
    }

    // Append command immediately
    const tempLog: CommandLog = {
      id: logId,
      timestamp: new Date().toLocaleTimeString(),
      command: trimmed,
      output: 'Executing Java Picocli command and dispatching REST call...',
      type: 'info'
    };
    setLogs((prev) => [...prev, tempLog]);

    try {
      const result = await executePicocliCommand(trimmed, config, updateConfig);
      setLogs((prev) =>
        prev.map((l) =>
          l.id === logId
            ? {
                ...l,
                output: result.output,
                type: result.type,
                structuredData: result.structuredData
              }
            : l
        )
      );
    } catch (err: any) {
      setLogs((prev) =>
        prev.map((l) =>
          l.id === logId
            ? {
                ...l,
                output: `Exception in Picocli execution: ${err.message}`,
                type: 'error'
              }
            : l
        )
      );
    } finally {
      setIsExecuting(false);
      setInput('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleRun(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInput(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      if (historyIndex < history.length - 1) {
        const nextIndex = historyIndex + 1;
        setHistoryIndex(nextIndex);
        setInput(history[nextIndex]);
      } else {
        setHistoryIndex(-1);
        setInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
    }
  };

  const handleTabCompletion = () => {
    const candidates = [
      'gitcontrib issue list',
      'gitcontrib issue view',
      'gitcontrib issue claim',
      'gitcontrib issue create',
      'gitcontrib pr submit',
      'gitcontrib pr list',
      'gitcontrib pr view',
      'gitcontrib pr checks',
      'gitcontrib sync',
      'gitcontrib config get',
      'gitcontrib config set',
      'gitcontrib maven build',
      'gitcontrib --help'
    ];

    const match = candidates.find((c) => c.startsWith(input));
    if (match) {
      setInput(match);
    }
  };

  const copyLogOutput = (id: string, text: string) => {
    navigator.clipboard.writeText(stripAnsi(text));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Convert ANSI escape codes into colored styled HTML spans
  const renderAnsi = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      return (
        <div key={idx} className="leading-relaxed">
          {parseAnsiLine(line)}
        </div>
      );
    });
  };

  const presets = [
    {
      label: 'Find Good First Issues',
      cmd: `gitcontrib issue list --repo ${config.defaultRepo} --labels "good first issue"`
    },
    {
      label: 'Claim Issue #28140 & Branch',
      cmd: `gitcontrib issue claim 28140 --repo ${config.defaultRepo}`
    },
    {
      label: 'Submit Draft PR',
      cmd: `gitcontrib pr submit --repo ${config.defaultRepo} --title "fix: handle ternary cache miss" --issue 28140 --draft`
    },
    {
      label: 'Inspect PR CI Checks',
      cmd: `gitcontrib pr checks 28150 --repo ${config.defaultRepo}`
    },
    {
      label: 'Maven Build Info',
      cmd: `gitcontrib maven build`
    }
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-65px)] bg-slate-950 font-mono text-sm">
      {/* Terminal Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-slate-300 font-semibold">
            gitcontrib-shell <span className="text-slate-500">[{config.defaultRepo}]</span>
          </span>
          <span className="text-slate-600 hidden md:inline">·</span>
          <span className="text-slate-500 hidden md:inline">
            {config.useLiveApi ? 'GitHub REST API (Live)' : 'Sandbox Sandbox Mode'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLogs([])}
            className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Clear terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Preset Quick Actions */}
      <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-500 whitespace-nowrap">Presets:</span>
        {presets.map((p, i) => (
          <button
            key={i}
            onClick={() => handleRun(p.cmd)}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-300 rounded border border-slate-700/60 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Play className="w-2.5 h-2.5 text-cyan-400" />
            <span>{p.label}</span>
          </button>
        ))}
      </div>

      {/* Terminal Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="group relative">
            {/* Command Header */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">➜</span>
                <span className="text-cyan-400">gitcontrib</span>
                <span className="text-slate-300 font-semibold">{log.command}</span>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-slate-600 tabular-nums">{log.timestamp}</span>
                <button
                  onClick={() => copyLogOutput(log.id, log.output)}
                  className="p-1 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  title="Copy output"
                >
                  {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Output Display */}
            <div
              className={`p-3 rounded-lg border text-xs whitespace-pre-wrap ${
                log.type === 'error'
                  ? 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                  : log.type === 'success'
                  ? 'bg-emerald-950/20 border-emerald-900/40 text-slate-200'
                  : 'bg-slate-900/40 border-slate-800 text-slate-300'
              }`}
            >
              {renderAnsi(log.output)}
            </div>
          </div>
        ))}

        <div ref={terminalEndRef} />
      </div>

      {/* Command Input Bar */}
      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-emerald-400 font-bold shrink-0">
          <span>➜</span>
          <span className="text-slate-400 font-normal">gitcontrib</span>
        </div>

        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isExecuting}
          placeholder="e.g., issue list --labels 'good first issue'  (Tab to autocomplete, Enter to run)"
          className="flex-1 bg-transparent text-slate-100 placeholder:text-slate-600 focus:outline-none text-xs font-mono"
          autoFocus
        />

        <button
          onClick={() => handleRun(input)}
          disabled={isExecuting || !input.trim()}
          className="flex items-center gap-1 px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 text-xs font-semibold rounded transition-colors cursor-pointer"
        >
          {isExecuting ? (
            <span className="animate-spin text-xs">⟳</span>
          ) : (
            <CornerDownLeft className="w-3.5 h-3.5" />
          )}
          <span>Run</span>
        </button>
      </div>
    </div>
  );
};

// Helper: Parse ANSI color codes into React elements
function parseAnsiLine(line: string) {
  const parts = line.split(/(\x1b\[[0-9;]*m)/);
  let currentClass = '';

  return parts.map((part, index) => {
    if (part.startsWith('\x1b[')) {
      if (part === '\x1b[0m') {
        currentClass = '';
      } else if (part.includes('32m')) {
        currentClass = 'text-emerald-400';
      } else if (part.includes('33m')) {
        currentClass = 'text-amber-400';
      } else if (part.includes('34m')) {
        currentClass = 'text-sky-400';
      } else if (part.includes('36m')) {
        currentClass = 'text-cyan-400';
      } else if (part.includes('31m')) {
        currentClass = 'text-rose-400';
      } else if (part.includes('1m') || part.includes('1;')) {
        currentClass += ' font-bold';
      }
      return null;
    }
    return (
      <span key={index} className={currentClass || undefined}>
        {part}
      </span>
    );
  });
}

function stripAnsi(str: string): string {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}
