/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Header } from './components/Header';
import { Terminal } from './components/Terminal';
import { IssueTracker } from './components/IssueTracker';
import { PrAutomationWizard } from './components/PrAutomationWizard';
import { CodeExplorer } from './components/CodeExplorer';
import { RestApiInspector } from './components/RestApiInspector';
import { ConfigModal } from './components/ConfigModal';
import { ShortcutsModal } from './components/ShortcutsModal';
import { CliConfig } from './types';

const DEFAULT_CONFIG: CliConfig = {
  githubToken: '',
  defaultRepo: 'facebook/react',
  authorName: 'Open Source Contributor',
  authorEmail: 'contributor@example.com',
  useLiveApi: true,
  restEndpoint: 'https://api.github.com',
};

export default function App() {
  const [activeTab, setActiveTab] = useState<'terminal' | 'issues' | 'pr-wizard' | 'code' | 'api'>('terminal');
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [externalCommand, setExternalCommand] = useState<string | null>(null);

  // Focus trigger signals for terminal input & issue search
  const [terminalFocusTrigger, setTerminalFocusTrigger] = useState(0);
  const [issueFocusTrigger, setIssueFocusTrigger] = useState(0);

  // Discreet shortcut indicator HUD
  const [shortcutFeedback, setShortcutFeedback] = useState<string | null>(null);
  const feedbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Selected issue passed into PR Wizard
  const [wizardIssueNumber, setWizardIssueNumber] = useState<number | undefined>(undefined);
  const [wizardIssueTitle, setWizardIssueTitle] = useState<string | undefined>(undefined);

  const [config, setConfig] = useState<CliConfig>(() => {
    try {
      const saved = localStorage.getItem('gitcontrib_config');
      if (saved) {
        return { ...DEFAULT_CONFIG, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn('Could not read config from localStorage', e);
    }
    return DEFAULT_CONFIG;
  });

  const showShortcutFeedback = (msg: string) => {
    if (feedbackTimeoutRef.current) {
      clearTimeout(feedbackTimeoutRef.current);
    }
    setShortcutFeedback(msg);
    feedbackTimeoutRef.current = setTimeout(() => {
      setShortcutFeedback(null);
    }, 1500);
  };

  const updateConfig = (patch: Partial<CliConfig>) => {
    setConfig((prev) => {
      const updated = { ...prev, ...patch };
      try {
        localStorage.setItem('gitcontrib_config', JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not save config to localStorage', e);
      }
      return updated;
    });
  };

  const handleRunCommandInTerminal = (cmd: string) => {
    setExternalCommand(cmd);
    setActiveTab('terminal');
    setTerminalFocusTrigger((prev) => prev + 1);
  };

  const handleOpenPrWizard = (issueNumber: number, title: string) => {
    setWizardIssueNumber(issueNumber);
    setWizardIssueTitle(title);
    setActiveTab('pr-wizard');
  };

  // GLOBAL KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.ctrlKey || e.metaKey;
      const target = e.target as HTMLElement;
      const isInput =
        target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT');

      // Esc: Close any open modal
      if (e.key === 'Escape') {
        if (isShortcutsOpen) {
          setIsShortcutsOpen(false);
          e.preventDefault();
          return;
        }
        if (isConfigOpen) {
          setIsConfigOpen(false);
          e.preventDefault();
          return;
        }
      }

      // '?' key: Open Shortcuts guide (only when user is not typing in an input/textarea)
      if ((e.key === '?' || (e.shiftKey && e.key === '/')) && !isInput && !isModifier) {
        e.preventDefault();
        setIsShortcutsOpen(true);
        return;
      }

      // Ctrl+K: Focus Terminal
      if (isModifier && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        setActiveTab('terminal');
        setTerminalFocusTrigger((prev) => prev + 1);
        showShortcutFeedback('Ctrl+K · CLI Terminal focused');
        return;
      }

      // Ctrl+I: Open Issue Tracker
      if (isModifier && (e.key === 'i' || e.key === 'I')) {
        e.preventDefault();
        setActiveTab('issues');
        setIssueFocusTrigger((prev) => prev + 1);
        showShortcutFeedback('Ctrl+I · Issue Tracker');
        return;
      }

      // Ctrl+P: Open PR Automator
      if (isModifier && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setActiveTab('pr-wizard');
        showShortcutFeedback('Ctrl+P · PR Automator');
        return;
      }

      // Ctrl+M: Open Maven Codebase
      if (isModifier && (e.key === 'm' || e.key === 'M')) {
        e.preventDefault();
        setActiveTab('code');
        showShortcutFeedback('Ctrl+M · Maven Codebase');
        return;
      }

      // Ctrl+R or Ctrl+J: Open REST & Jackson Inspector
      if (isModifier && (e.key === 'r' || e.key === 'R' || e.key === 'j' || e.key === 'J')) {
        e.preventDefault();
        setActiveTab('api');
        showShortcutFeedback('Ctrl+R · REST API Inspector');
        return;
      }

      // Ctrl+,: Open Configuration
      if (isModifier && e.key === ',') {
        e.preventDefault();
        setIsConfigOpen(true);
        showShortcutFeedback('Ctrl+, · CLI Settings');
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (feedbackTimeoutRef.current) {
        clearTimeout(feedbackTimeoutRef.current);
      }
    };
  }, [isShortcutsOpen, isConfigOpen]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 3-Zone Top Navigation Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenSettings={() => setIsConfigOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        defaultRepo={config.defaultRepo}
      />

      {/* Main Workspace Body */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {activeTab === 'terminal' && (
          <Terminal
            config={config}
            updateConfig={updateConfig}
            externalCommand={externalCommand}
            onClearExternalCommand={() => setExternalCommand(null)}
            onSwitchToPrWizard={handleOpenPrWizard}
            focusTrigger={terminalFocusTrigger}
          />
        )}

        {activeTab === 'issues' && (
          <IssueTracker
            config={config}
            onRunCommandInTerminal={handleRunCommandInTerminal}
            onOpenPrWizard={handleOpenPrWizard}
            focusTrigger={issueFocusTrigger}
          />
        )}

        {activeTab === 'pr-wizard' && (
          <PrAutomationWizard
            config={config}
            initialIssueNumber={wizardIssueNumber}
            initialIssueTitle={wizardIssueTitle}
            onRunInTerminal={handleRunCommandInTerminal}
            onClearInitialIssue={() => {
              setWizardIssueNumber(undefined);
              setWizardIssueTitle(undefined);
            }}
          />
        )}

        {activeTab === 'code' && <CodeExplorer />}

        {activeTab === 'api' && <RestApiInspector config={config} />}

        {/* Discreet Shortcut HUD Feedback Notification */}
        {shortcutFeedback && (
          <div className="fixed bottom-5 right-5 z-50 pointer-events-none flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/40 text-cyan-300 text-xs font-mono shadow-xl transition-all animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>{shortcutFeedback}</span>
          </div>
        )}
      </main>

      {/* Configuration Modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        config={config}
        onSave={updateConfig}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <ShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
