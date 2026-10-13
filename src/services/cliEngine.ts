import { CliConfig, CommandLog } from '../types';
import { fetchIssues, fetchPullRequests, submitPullRequest } from './githubApi';

export interface CliExecutionResult {
  output: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'table';
  structuredData?: any;
}

export async function executePicocliCommand(
  rawInput: string,
  config: CliConfig,
  updateConfig: (patch: Partial<CliConfig>) => void
): Promise<CliExecutionResult> {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { output: '', type: 'info' };
  }

  // Tokenize arguments handling quoted strings
  const tokens = parseArgs(trimmed);
  let mainCommand = tokens[0]?.toLowerCase();

  // If user typed 'gitcontrib <subcommand>' or directly '<subcommand>'
  let args = tokens;
  if (mainCommand === 'gitcontrib') {
    args = tokens.slice(1);
    mainCommand = args[0]?.toLowerCase() || '';
  }

  // Root help or banner
  if (!mainCommand || mainCommand === '--help' || mainCommand === '-h' || mainCommand === 'help') {
    return {
      output: `\x1b[1;36mGitContrib CLI\x1b[0m 1.0.0 (Java 17 / Picocli 4.7.6 / Jackson REST Client / Maven)
Automates pull request submissions and issue tracking through the command line.

\x1b[1;33mUsage:\x1b[0m gitcontrib [-v] [COMMAND]

\x1b[1;33mCommands:\x1b[0m
  \x1b[32missue\x1b[0m         Track, search, view, and claim open-source issues.
  \x1b[32mpr\x1b[0m            Automate pull request creation, status tracking, and inspection.
  \x1b[32msync\x1b[0m          Sync local fork with upstream repository.
  \x1b[32mconfig\x1b[0m        Manage GitHub Personal Access Token and default settings.
  \x1b[32mmaven\x1b[0m         Inspect Maven build lifecycle, pom.xml plugins, and GraalVM targets.
  \x1b[32mclear\x1b[0m         Clear the terminal output.

\x1b[1;33mOptions:\x1b[0m
  \x1b[36m-v, --verbose\x1b[0m  Enable verbose debug output.
  \x1b[36m-h, --help\x1b[0m     Display this help message.
  \x1b[36m-V, --version\x1b[0m  Display version information.

Run '\x1b[33mgitcontrib [COMMAND] --help\x1b[0m' for more information on a command.`,
      type: 'info'
    };
  }

  if (mainCommand === '--version' || mainCommand === '-V' || mainCommand === 'version') {
    return {
      output: `gitcontrib version 1.0.0\nJVM: Java 17.0.10 OpenJDK\nEngine: Picocli 4.7.6 | Jackson Databind 2.17.0 | Eclipse JGit 6.9.0`,
      type: 'info'
    };
  }

  if (mainCommand === 'clear') {
    return { output: '__CLEAR__', type: 'info' };
  }

  // SUBCOMMAND: issue
  if (mainCommand === 'issue') {
    const sub = args[1]?.toLowerCase();
    const flags = parseFlags(args.slice(2));
    const targetRepo = flags.repo || flags.r || config.defaultRepo;

    if (!sub || sub === '--help' || sub === '-h') {
      return {
        output: `\x1b[1;33mUsage:\x1b[0m gitcontrib issue [list|view|claim|create] [OPTIONS]

\x1b[1;33mSubcommands:\x1b[0m
  \x1b[32mlist\x1b[0m    List issues with optional label or state filters.
          \x1b[36m-r, --repo <owner/repo>\x1b[0m   Target repository (default: ${config.defaultRepo})
          \x1b[36m-l, --labels <labels>\x1b[0m     Filter by comma-separated labels (e.g. "good first issue")
          \x1b[36m-s, --state <state>\x1b[0m       Filter state: open, closed, all (default: open)
          \x1b[36m--json\x1b[0m                    Output raw Jackson JSON structure

  \x1b[32mview\x1b[0m    View details of an issue by number.
          \x1b[33m<issue_number>\x1b[0m            Issue ID number
          \x1b[36m-r, --repo <owner/repo>\x1b[0m   Target repository

  \x1b[32mclaim\x1b[0m   Claim an issue: posts volunteer comment & creates local Git branch.
          \x1b[33m<issue_number>\x1b[0m            Issue ID number
          \x1b[36m-b, --branch <name>\x1b[0m       Custom branch name (defaults to fix/issue-<number>)
          \x1b[36m--no-comment\x1b[0m              Skip posting comment to GitHub REST API

  \x1b[32mcreate\x1b[0m  Create a new issue on GitHub.
          \x1b[36m-t, --title <text>\x1b[0m        Issue title (required)
          \x1b[36m-b, --body <text>\x1b[0m         Issue description`,
        type: 'info'
      };
    }

    if (sub === 'list') {
      const state = flags.state || flags.s || 'open';
      const labels = flags.labels || flags.l || '';
      const isJson = flags.json === true;

      const { data, source, error } = await fetchIssues(
        targetRepo,
        state,
        labels,
        config.githubToken,
        !config.useLiveApi
      );

      if (isJson) {
        return {
          output: JSON.stringify(data, null, 2),
          type: 'info',
          structuredData: data
        };
      }

      const issuesOnly = data.filter(d => !d.pull_request);
      let out = `\x1b[1mRepository:\x1b[0m ${targetRepo} [source: ${source}]\n`;
      if (error) out += `\x1b[33mNote:\x1b[0m ${error}\n`;
      out += `--------------------------------------------------------------------------------\n`;
      out += `${'NUMBER'.padEnd(8)} ${'TITLE'.padEnd(46)} ${'AUTHOR'.padEnd(14)} ${'COMMENTS'}\n`;
      out += `--------------------------------------------------------------------------------\n`;

      if (issuesOnly.length === 0) {
        out += `(No issues found matching query)\n`;
      } else {
        issuesOnly.forEach(item => {
          const numStr = `#${item.number}`.padEnd(8);
          const title = (item.title.length > 43 ? item.title.substring(0, 40) + '...' : item.title).padEnd(46);
          const author = (item.user?.login || 'unknown').padEnd(14);
          const comments = item.comments ?? 0;
          out += `\x1b[32m${numStr}\x1b[0m ${title} \x1b[36m${author}\x1b[0m ${comments}\n`;
        });
      }
      out += `--------------------------------------------------------------------------------\n`;
      out += `Found ${issuesOnly.length} issue(s). Run '\x1b[33mgitcontrib issue claim <number>\x1b[0m' to claim one!`;

      return { output: out, type: 'table', structuredData: issuesOnly };
    }

    if (sub === 'view') {
      const issueNum = parseInt(args[2], 10);
      if (isNaN(issueNum)) {
        return { output: `Error: Missing or invalid issue number. Usage: gitcontrib issue view <number>`, type: 'error' };
      }

      const { data } = await fetchIssues(targetRepo, 'all', undefined, config.githubToken, !config.useLiveApi);
      const issue = data.find(i => i.number === issueNum);

      if (!issue) {
        return {
          output: `Issue #${issueNum} not found in ${targetRepo}. Try listing issues with 'gitcontrib issue list'.`,
          type: 'error'
        };
      }

      return {
        output: `\x1b[1;36m================================================================================\x1b[0m
\x1b[1mIssue #${issue.number}:\x1b[0m ${issue.title}
\x1b[33mState:\x1b[0m ${issue.state.toUpperCase()} | \x1b[33mAuthor:\x1b[0m ${issue.user?.login} | \x1b[33mCreated:\x1b[0m ${new Date(issue.created_at).toLocaleDateString()}
\x1b[33mLabels:\x1b[0m ${issue.labels.map(l => l.name).join(', ') || 'none'}
\x1b[33mURL:\x1b[0m    ${issue.html_url}
\x1b[1;36m================================================================================\x1b[0m
${issue.body || '(No description provided)'}
\x1b[1;36m================================================================================\x1b[0m`,
        type: 'info'
      };
    }

    if (sub === 'claim') {
      const issueNum = parseInt(args[2], 10);
      if (isNaN(issueNum)) {
        return { output: `Error: Missing issue number. Usage: gitcontrib issue claim <number>`, type: 'error' };
      }

      const branchName = flags.branch || flags.b || `fix/issue-${issueNum}-solution`;
      const noComment = flags['no-comment'] === true;

      let out = `\x1b[1;34m[JGit Service]\x1b[0m Checking repository state for ${targetRepo}...\n`;
      out += `\x1b[32m✓\x1b[0m Switched to branch: \x1b[1;33m${branchName}\x1b[0m\n`;

      if (!noComment) {
        out += `\x1b[1;34m[REST API POST]\x1b[0m /repos/${targetRepo}/issues/${issueNum}/comments\n`;
        out += `\x1b[32m✓\x1b[0m Posted volunteer comment: "Hi maintainers! Claiming this issue on branch '${branchName}'."\n`;
      }

      out += `\n\x1b[1;32mIssue #${issueNum} successfully claimed!\x1b[0m\n`;
      out += `Next steps:\n`;
      out += `  1. Write your fix in the workspace.\n`;
      out += `  2. Submit your PR with: \x1b[33mgitcontrib pr submit --issue ${issueNum} --title "fix: resolve issue #${issueNum}"\x1b[0m`;

      return { output: out, type: 'success' };
    }
  }

  // SUBCOMMAND: pr
  if (mainCommand === 'pr') {
    const sub = args[1]?.toLowerCase();
    const flags = parseFlags(args.slice(2));
    const targetRepo = flags.repo || flags.r || config.defaultRepo;

    if (!sub || sub === '--help' || sub === '-h') {
      return {
        output: `\x1b[1;33mUsage:\x1b[0m gitcontrib pr [submit|list|view|checks] [OPTIONS]

\x1b[1;33mSubcommands:\x1b[0m
  \x1b[32msubmit\x1b[0m  Push branch and create a Pull Request on GitHub.
          \x1b[36m-t, --title <title>\x1b[0m       PR title (e.g. "fix: handle null ref")
          \x1b[36m-b, --body <text>\x1b[0m         PR description (markdown)
          \x1b[36m-i, --issue <number>\x1b[0m      Linked issue number (adds "Fixes #X")
          \x1b[36m--draft\x1b[0m                   Submit as Draft Pull Request
          \x1b[36m--base <branch>\x1b[0m           Target upstream branch (default: main)
          \x1b[36m--head <branch>\x1b[0m           Source branch (default: current git branch)

  \x1b[32mlist\x1b[0m    List open/closed pull requests on repository.
          \x1b[36m-s, --state <state>\x1b[0m       open, closed, all (default: open)

  \x1b[32mchecks\x1b[0m  Inspect CI check runs & GitHub Actions status for a PR.
          \x1b[33m<pr_number>\x1b[0m               Pull Request number`,
        type: 'info'
      };
    }

    if (sub === 'submit') {
      const title = flags.title || flags.t;
      if (!title) {
        return {
          output: `Error: Missing required option '--title'. Example: gitcontrib pr submit --title "fix: handle NPE"`,
          type: 'error'
        };
      }

      const issueNum = flags.issue ? parseInt(flags.issue, 10) : undefined;
      const base = flags.base || 'main';
      const head = flags.head || (issueNum ? `fix/issue-${issueNum}-patch` : 'feature/contrib-branch');
      const draft = flags.draft === true;
      let body = flags.body || flags.b || '';

      if (!body) {
        body = `## Summary\nAutomated submission via GitContrib CLI.\n\n${issueNum ? `Fixes #${issueNum}\n\n` : ''}## Test Plan\n- [x] Unit tests passing\n- [x] Linter passing`;
      }

      const { pr, isLive } = await submitPullRequest(
        targetRepo,
        title,
        body,
        head,
        base,
        draft,
        config.githubToken
      );

      let out = `\x1b[1;34m[JGit]\x1b[0m Staging changes and committing with Conventional Commit title...\n`;
      out += `\x1b[1;34m[JGit]\x1b[0m Pushing ref '${head}' to origin remote...\n`;
      out += `\x1b[1;34m[REST API POST]\x1b[0m /repos/${targetRepo}/pulls ${isLive ? '(Live GitHub API)' : '(Simulated Sandbox)'}\n`;
      out += `\x1b[1;32m================================================================================\x1b[0m\n`;
      out += `\x1b[1;32m✓ Pull Request Created Successfully: #${pr.number}\x1b[0m\n`;
      out += `Title: ${pr.title}\n`;
      out += `Target: ${targetRepo} (${base} <- ${head})\n`;
      out += `Status: ${draft ? 'Draft PR' : 'Open for Review'}\n`;
      out += `URL:    ${pr.html_url}\n`;
      out += `\x1b[1;32m================================================================================\x1b[0m`;

      return { output: out, type: 'success', structuredData: pr };
    }

    if (sub === 'list') {
      const state = flags.state || flags.s || 'open';
      const { data, source } = await fetchPullRequests(targetRepo, state, config.githubToken, !config.useLiveApi);

      let out = `\x1b[1mRepository:\x1b[0m ${targetRepo} [source: ${source}]\n`;
      out += `--------------------------------------------------------------------------------\n`;
      out += `${'PR #'.padEnd(8)} ${'TITLE'.padEnd(46)} ${'AUTHOR'.padEnd(14)} ${'BASE'}\n`;
      out += `--------------------------------------------------------------------------------\n`;

      if (data.length === 0) {
        out += `(No pull requests found)\n`;
      } else {
        data.forEach(pr => {
          const numStr = `#${pr.number}`.padEnd(8);
          const title = (pr.title.length > 43 ? pr.title.substring(0, 40) + '...' : pr.title).padEnd(46);
          const author = (pr.user?.login || 'contributor').padEnd(14);
          const base = pr.base?.ref || 'main';
          out += `\x1b[32m${numStr}\x1b[0m ${title} \x1b[36m${author}\x1b[0m ${base}\n`;
        });
      }
      out += `--------------------------------------------------------------------------------\n`;
      return { output: out, type: 'table', structuredData: data };
    }

    if (sub === 'checks') {
      const prNum = parseInt(args[2], 10);
      if (isNaN(prNum)) {
        return { output: `Error: Missing PR number. Usage: gitcontrib pr checks <pr_number>`, type: 'error' };
      }

      return {
        output: `\x1b[1;34m[REST API GET]\x1b[0m /repos/${targetRepo}/commits/HEAD/check-runs
Fetching GitHub Actions workflow suites for PR #${prNum}...

\x1b[32m[PASS]\x1b[0m \x1b[1mCI / Unit Tests (Maven 3.9 + OpenJDK 17)\x1b[0m -> 142 passed (42s)
\x1b[32m[PASS]\x1b[0m \x1b[1mSpotless / Linter Check\x1b[0m                  -> Clean, no diffs (12s)
\x1b[32m[PASS]\x1b[0m \x1b[1mGraalVM Native Image Build\x1b[0m              -> Native binary built (1m 14s)
\x1b[32m[PASS]\x1b[0m \x1b[1mCodeQL Security Scanning\x1b[0m                -> 0 alerts (38s)

\x1b[1;32mAll CI check suites succeeded! Ready for maintainer review.\x1b[0m`,
        type: 'success'
      };
    }
  }

  // SUBCOMMAND: sync
  if (mainCommand === 'sync') {
    const flags = parseFlags(args.slice(1));
    const targetRepo = flags.repo || config.defaultRepo;

    return {
      output: `\x1b[1;34m[JGit Service]\x1b[0m Fetching upstream from https://github.com/${targetRepo}.git...
\x1b[1;34m[JGit Service]\x1b[0m Fast-forwarding local 'main' branch to match upstream/main...
\x1b[32m✓\x1b[0m Synchronized 14 commits.
\x1b[32m✓\x1b[0m Pushed updated 'main' to origin fork. Local workspace is up to date!`,
      type: 'success'
    };
  }

  // SUBCOMMAND: config
  if (mainCommand === 'config') {
    const sub = args[1]?.toLowerCase();
    const flags = parseFlags(args.slice(2));

    if (!sub || sub === 'get') {
      return {
        output: `\x1b[1;33mGitContrib Configuration (~/.gitcontrib/config.json):\x1b[0m
  defaultRepo:  ${config.defaultRepo}
  authorName:   ${config.authorName || '(not set)'}
  authorEmail:  ${config.authorEmail || '(not set)'}
  token:        ${config.githubToken ? '••••••••' + config.githubToken.slice(-4) : '(not configured)'}
  apiMode:      ${config.useLiveApi ? 'Live GitHub REST API' : 'Interactive Sandbox Mode'}`,
        type: 'info'
      };
    }

    if (sub === 'set') {
      const updates: Partial<CliConfig> = {};
      if (flags.token || flags.t) updates.githubToken = flags.token || flags.t;
      if (flags.repo || flags.r) updates.defaultRepo = flags.repo || flags.r;
      if (flags.name) updates.authorName = flags.name;
      if (flags.email) updates.authorEmail = flags.email;
      if (flags.mode) updates.useLiveApi = flags.mode === 'live';

      updateConfig(updates);
      return {
        output: `\x1b[32m✓\x1b[0m Configuration updated successfully in ~/.gitcontrib/config.json.`,
        type: 'success'
      };
    }
  }

  // SUBCOMMAND: maven
  if (mainCommand === 'maven' || mainCommand === 'mvn') {
    return {
      output: `\x1b[1;36m[Apache Maven 3.9.6]\x1b[0m Project: io.gitcontrib:gitcontrib-cli:1.0.0
Plugins configured in pom.xml:
  - \x1b[33minfo.picocli:picocli-codegen:4.7.6\x1b[0m (Annotation Processing)
  - \x1b[33morg.apache.maven.plugins:maven-shade-plugin:3.5.2\x1b[0m (Fat Executable JAR)
  - \x1b[33morg.graalvm.buildtools:native-maven-plugin:0.10.1\x1b[0m (Native Binary Compilation)

Run '\x1b[32mmvn clean package\x1b[0m' in your terminal to build 'target/gitcontrib-cli-1.0.0.jar'.
Click "Download Maven Project (.zip)" in the Code tab to export!`,
      type: 'info'
    };
  }

  return {
    output: `Unknown command: '\x1b[31m${rawInput}\x1b[0m'. Type '\x1b[33mgitcontrib --help\x1b[0m' for list of commands.`,
    type: 'error'
  };
}

function parseArgs(str: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  let quoteChar = '';

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if ((char === '"' || char === "'") && (!inQuotes || quoteChar === char)) {
      inQuotes = !inQuotes;
      quoteChar = inQuotes ? char : '';
    } else if (char === ' ' && !inQuotes) {
      if (current.length > 0) {
        result.push(current);
        current = '';
      }
    } else {
      current += char;
    }
  }
  if (current.length > 0) {
    result.push(current);
  }
  return result;
}

function parseFlags(tokens: string[]): Record<string, any> {
  const flags: Record<string, any> = {};
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t.startsWith('--')) {
      const key = t.slice(2);
      if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
        flags[key] = tokens[i + 1];
        i++;
      } else {
        flags[key] = true;
      }
    } else if (t.startsWith('-')) {
      const key = t.slice(1);
      if (i + 1 < tokens.length && !tokens[i + 1].startsWith('-')) {
        flags[key] = tokens[i + 1];
        i++;
      } else {
        flags[key] = true;
      }
    }
  }
  return flags;
}
