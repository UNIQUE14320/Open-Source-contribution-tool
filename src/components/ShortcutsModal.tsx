import React from 'react';
import { X, Keyboard, Command } from 'lucide-react';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    {
      group: 'Global Navigation',
      items: [
        { keys: ['Ctrl', 'K'], macKeys: ['⌘', 'K'], label: 'Focus CLI Terminal' },
        { keys: ['Ctrl', 'I'], macKeys: ['⌘', 'I'], label: 'Open Issue Tracker' },
        { keys: ['Ctrl', 'P'], macKeys: ['⌘', 'P'], label: 'Open Pull Request Automator' },
        { keys: ['Ctrl', 'M'], macKeys: ['⌘', 'M'], label: 'View Maven Codebase & pom.xml' },
        { keys: ['Ctrl', 'R'], macKeys: ['⌘', 'R'], label: 'Inspect REST API & Jackson Models' },
        { keys: ['Ctrl', ','], macKeys: ['⌘', ','], label: 'Open CLI Configuration Settings' },
        { keys: ['?'], macKeys: ['?'], label: 'Show Keyboard Shortcuts (This dialog)' },
        { keys: ['Esc'], macKeys: ['Esc'], label: 'Close Active Modal / Drawer' }
      ]
    },
    {
      group: 'Terminal Commands & Controls',
      items: [
        { keys: ['Enter'], macKeys: ['Return'], label: 'Execute Picocli command' },
        { keys: ['Tab'], macKeys: ['Tab'], label: 'Autocomplete command, flag, or option' },
        { keys: ['↑', '↓'], macKeys: ['↑', '↓'], label: 'Cycle through command history' }
      ]
    }
  ];

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Keyboard className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Global Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs overflow-y-auto max-h-[70vh]">
          {shortcuts.map((section, sIdx) => (
            <div key={sIdx} className="space-y-3">
              <h3 className="text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                {section.group}
              </h3>
              <div className="space-y-2">
                {section.items.map((item, iIdx) => {
                  const displayKeys = isMac ? item.macKeys : item.keys;
                  return (
                    <div
                      key={iIdx}
                      className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-slate-950/80 border border-slate-800/80"
                    >
                      <span className="text-slate-200 font-medium">{item.label}</span>
                      <div className="flex items-center gap-1 shrink-0">
                        {displayKeys.map((k, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-800 text-cyan-300 border border-slate-700 shadow-xs"
                          >
                            {k}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 bg-slate-950 border-t border-slate-800 text-[11px] text-slate-500">
          <span>Press <kbd className="font-mono text-slate-400 bg-slate-900 border border-slate-800 px-1 py-0.5 rounded">Esc</kbd> anytime to exit</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded transition-colors cursor-pointer"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
