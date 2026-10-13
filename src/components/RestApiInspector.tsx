import React, { useState } from 'react';
import { Network, Send, Check, Copy, ArrowRight, Database, Terminal, ShieldCheck } from 'lucide-react';
import { CliConfig } from '../types';

interface RestApiInspectorProps {
  config: CliConfig;
}

export const RestApiInspector: React.FC<RestApiInspectorProps> = ({ config }) => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'list-issues' | 'create-pr' | 'post-comment'>('list-issues');
  const [copied, setCopied] = useState(false);

  const endpoints = [
    {
      id: 'list-issues',
      method: 'GET',
      path: `/repos/${config.defaultRepo}/issues?state=open&labels=good+first+issue`,
      description: 'Fetch open issues filtered by label for discovery',
      jacksonModel: 'List<Issue> = objectMapper.readValue(json, new TypeReference<List<Issue>>() {})',
      samplePayload: null,
      sampleResponse: `[
  {
    "id": 28140,
    "number": 28140,
    "title": "fix(compiler): Memoization cache missed during nested JSX ternaries",
    "state": "open",
    "user": {
      "login": "gaearon",
      "id": 810438
    },
    "labels": [
      { "id": 1, "name": "good first issue", "color": "7057ff" }
    ],
    "comments": 6,
    "created_at": "2026-03-12T14:22:10Z",
    "html_url": "https://github.com/${config.defaultRepo}/issues/28140"
  }
]`
    },
    {
      id: 'create-pr',
      method: 'POST',
      path: `/repos/${config.defaultRepo}/pulls`,
      description: 'Submit an automated Pull Request with Conventional Commits and checklist',
      jacksonModel: 'PullRequest = objectMapper.readValue(response.body(), PullRequest.class)',
      samplePayload: `{
  "title": "fix(compiler): reconcile memo cache slots for ternary expressions",
  "head": "fix/issue-28140-ternary-cache",
  "base": "main",
  "body": "## Description\\nResolves cache miss regression.\\n\\nFixes #28140\\n\\n## Checklist\\n- [x] Unit tests passing",
  "draft": false
}`,
      sampleResponse: `{
  "id": 28150,
  "number": 28150,
  "title": "fix(compiler): reconcile memo cache slots for ternary expressions",
  "state": "open",
  "html_url": "https://github.com/${config.defaultRepo}/pull/28150",
  "user": { "login": "contributor", "id": 10293 },
  "head": { "ref": "fix/issue-28140-ternary-cache", "sha": "a8b7c6d5e4" },
  "base": { "ref": "main" },
  "draft": false
}`
    },
    {
      id: 'post-comment',
      method: 'POST',
      path: `/repos/${config.defaultRepo}/issues/28140/comments`,
      description: 'Claim an issue by posting volunteer comment to the conversation',
      jacksonModel: 'objectMapper.writeValueAsString(Map.of("body", commentText))',
      samplePayload: `{
  "body": "Hi @maintainers! I'd love to work on this issue. Starting development on branch 'fix/issue-28140-ternary-cache'."
}`,
      sampleResponse: `{
  "id": 1928374,
  "body": "Hi @maintainers! I'd love to work on this issue. Starting development on branch 'fix/issue-28140-ternary-cache'.",
  "created_at": "2026-04-12T10:00:00Z",
  "user": { "login": "contributor" }
}`
    }
  ];

  const current = endpoints.find((e) => e.id === selectedEndpoint) || endpoints[0];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-slate-950 text-slate-100">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">GitHub REST API & Jackson JSON Architecture</h1>
          <p className="text-xs text-slate-400 mt-1">
            How GitContrib CLI uses Java 17 HttpClient and Jackson ObjectMapper to interact with GitHub REST API v3.
          </p>
        </div>

        {/* Jackson & HTTP/2 Key Principles Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Database className="w-4 h-4 text-cyan-400" />
              <span>Jackson Deserialization</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Configured with <code className="text-cyan-300">FAIL_ON_UNKNOWN_PROPERTIES = false</code> so GitHub API schema expansions never break your CLI runtime.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Personal Access Token</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Injected via <code className="text-cyan-300">Authorization: Bearer &lt;token&gt;</code> header. Cached in user's encrypted home directory config.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-white">
              <Terminal className="w-4 h-4 text-amber-400" />
              <span>HTTP/2 Non-Blocking</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              Uses modern standard <code className="text-cyan-300">java.net.http.HttpClient</code> without legacy heavyweight external HTTP dependencies.
            </p>
          </div>
        </div>

        {/* Endpoint Selector Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
          {endpoints.map((ep) => (
            <button
              key={ep.id}
              onClick={() => setSelectedEndpoint(ep.id as any)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                selectedEndpoint === ep.id
                  ? 'bg-slate-900 text-white font-semibold border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
              }`}
            >
              <span
                className={`font-mono text-[11px] font-bold ${
                  ep.method === 'GET' ? 'text-emerald-400' : 'text-sky-400'
                }`}
              >
                {ep.method}
              </span>
              <span>{ep.id}</span>
            </button>
          ))}
        </div>

        {/* Selected Endpoint Card */}
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                  current.method === 'GET'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                }`}
              >
                {current.method}
              </span>
              <span className="font-mono text-xs text-white break-all">{current.path}</span>
            </div>
            <span className="text-xs text-slate-400">{current.description}</span>
          </div>

          {/* Java Jackson Code Binding */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1 text-xs">
            <div className="text-slate-400 font-semibold">Java 17 / Jackson Deserialization Expression:</div>
            <div className="font-mono text-cyan-300 break-all select-all">{current.jacksonModel}</div>
          </div>

          {/* Request Payload (if POST) */}
          {current.samplePayload && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
                <span>HTTP Request Body (JSON)</span>
                <button
                  onClick={() => handleCopy(current.samplePayload!)}
                  className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>Copy Payload</span>
                </button>
              </div>
              <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
                {current.samplePayload}
              </pre>
            </div>
          )}

          {/* Response Payload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300 font-semibold">
              <span>GitHub REST API Response Body (200 OK)</span>
              <button
                onClick={() => handleCopy(current.sampleResponse)}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>Copy Response</span>
              </button>
            </div>
            <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed max-h-72">
              {current.sampleResponse}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
