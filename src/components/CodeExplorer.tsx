import React, { useState } from 'react';
import { FileCode, Download, Copy, Check, Folder, ChevronRight, Terminal, BookOpen, Layers } from 'lucide-react';
import { MAVEN_FILES } from '../data/mavenFiles';
import { downloadMavenProjectZip } from '../services/zipExporter';

export const CodeExplorer: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<string>('pom.xml');
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const selectedFile = MAVEN_FILES.find((f) => f.path === selectedPath) || MAVEN_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadMavenProjectZip();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-65px)] bg-slate-950 overflow-hidden">
      {/* Subheader */}
      <div className="flex items-center justify-between px-6 py-3.5 bg-slate-900 border-b border-slate-800">
        <div>
          <h1 className="text-base font-bold text-white">Java + Maven Open Source CLI Project</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Production-ready source files with Picocli annotations, Jackson REST client, and GraalVM Native Image support.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isDownloading ? 'Packaging...' : 'Download Full ZIP'}</span>
          </button>
        </div>
      </div>

      {/* Main Split: File Tree on left, Code Viewer on right */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: File Tree */}
        <div className="w-72 bg-slate-900/60 border-r border-slate-800 flex flex-col overflow-y-auto">
          <div className="p-3 text-xs font-semibold text-slate-400 border-b border-slate-800/80 flex items-center gap-2">
            <Folder className="w-3.5 h-3.5 text-cyan-400" />
            <span>gitcontrib-cli/</span>
          </div>

          <div className="p-2 space-y-0.5 text-xs">
            {MAVEN_FILES.map((file) => {
              const isSelected = file.path === selectedPath;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedPath(file.path)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-500/10 text-cyan-300 font-semibold border border-cyan-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`} />
                  <span className="truncate">{file.name}</span>
                </button>
              );
            })}
          </div>

          {/* Maven Build Quick Guide card at bottom */}
          <div className="mt-auto p-3 m-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Maven Build</span>
            </div>
            <div className="text-slate-400 font-mono text-[11px] space-y-1">
              <div>$ mvn clean package</div>
              <div>$ java -jar target/gitcontrib-1.0.0.jar</div>
              <div className="text-slate-500 pt-1"># GraalVM Native:</div>
              <div>$ mvn package -Pnative</div>
            </div>
          </div>
        </div>

        {/* Right: Code Editor & Preview */}
        <div className="flex-1 flex flex-col overflow-hidden bg-slate-950">
          {/* File Tab Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-mono">path:</span>
              <span className="text-cyan-300 font-mono font-medium">{selectedFile.path}</span>
              <span className="text-slate-600">·</span>
              <span className="text-slate-400">{selectedFile.description}</span>
            </div>

            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 text-xs transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
          </div>

          {/* Code Viewer with Line Numbers */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs text-slate-300 flex">
            {/* Line numbers */}
            <div className="select-none text-slate-600 text-right pr-4 border-r border-slate-800 shrink-0 leading-relaxed font-mono">
              {selectedFile.content.split('\n').map((_, idx) => (
                <div key={idx} className="tabular-nums">
                  {idx + 1}
                </div>
              ))}
            </div>

            {/* Code Content */}
            <div className="pl-4 flex-1 overflow-x-auto leading-relaxed whitespace-pre font-mono">
              {selectedFile.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
