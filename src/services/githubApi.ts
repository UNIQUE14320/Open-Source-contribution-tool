import { GitHubIssue, GitHubPullRequest } from '../types';

export const MOCK_ISSUES: Record<string, GitHubIssue[]> = {
  'facebook/react': [
    {
      id: 28140,
      number: 28140,
      title: 'fix(compiler): Memoization cache missed during nested JSX ternaries',
      body: '### Description\nWhen compiling complex nested ternary operators inside JSX children, the memo cache entry is prematurely invalidated.\n\n### Steps to Reproduce\nSee test fixture `packages/react-compiler/src/__tests__/ternary-test.js`.\n\n### Expected Behavior\nCache slot should persist across re-renders.',
      state: 'open',
      user: { login: 'gaearon', id: 810438, avatar_url: 'https://avatars.githubusercontent.com/u/810438?v=4', html_url: 'https://github.com/gaearon' },
      labels: [
        { id: 1, name: 'good first issue', color: '7057ff' },
        { id: 2, name: 'compiler', color: 'd93f0b' },
        { id: 3, name: 'Component: Developer Tools', color: '0e8a16' }
      ],
      comments: 6,
      created_at: '2026-03-12T14:22:10Z',
      updated_at: '2026-04-01T09:15:30Z',
      html_url: 'https://github.com/facebook/react/issues/28140'
    },
    {
      id: 28141,
      number: 28141,
      title: 'docs: Clarify useTransition pending state lifecycle in Server Components',
      body: 'The documentation currently does not explicitly state that `isPending` remains true until async RSC stream chunk resolves on client.\n\nLooking for someone to expand the explanation in `docs/reference/react/useTransition.md`.',
      state: 'open',
      user: { login: 'rickhanlonii', id: 2440089, avatar_url: 'https://avatars.githubusercontent.com/u/2440089?v=4', html_url: 'https://github.com/rickhanlonii' },
      labels: [
        { id: 4, name: 'good first issue', color: '7057ff' },
        { id: 5, name: 'documentation', color: '0075ca' }
      ],
      comments: 4,
      created_at: '2026-03-20T10:11:00Z',
      updated_at: '2026-03-28T16:45:12Z',
      html_url: 'https://github.com/facebook/react/issues/28141'
    },
    {
      id: 28142,
      number: 28142,
      title: 'refactor: Remove deprecated findDOMNode warning flag in react-dom test runners',
      body: 'We can safely clean up dead branching in `packages/react-dom/__tests__/ReactServerRendering-test.js` where findDOMNode was previously tested under legacy modes.',
      state: 'open',
      user: { login: 'sophiebits', id: 953792, avatar_url: 'https://avatars.githubusercontent.com/u/953792?v=4', html_url: 'https://github.com/sophiebits' },
      labels: [
        { id: 6, name: 'help wanted', color: '008672' },
        { id: 7, name: 'Component: DOM', color: 'fbca04' }
      ],
      comments: 2,
      created_at: '2026-03-25T18:02:11Z',
      updated_at: '2026-04-02T11:20:00Z',
      html_url: 'https://github.com/facebook/react/issues/28142'
    }
  ]
};

export const MOCK_PRS: Record<string, GitHubPullRequest[]> = {
  'facebook/react': [
    {
      id: 28150,
      number: 28150,
      title: 'fix(compiler): memo cache slot reconciliation for ternary trees',
      body: '## Description\nFixes cache miss regression reported in #28140.\n\n## Related Issue\nFixes #28140\n\n## Checklist\n- [x] Unit tests added\n- [x] Linter passing',
      state: 'open',
      user: { login: 'dev-contributor', id: 10293, avatar_url: 'https://avatars.githubusercontent.com/u/10293?v=4', html_url: 'https://github.com/dev-contributor' },
      created_at: '2026-04-01T10:30:00Z',
      updated_at: '2026-04-02T14:10:00Z',
      html_url: 'https://github.com/facebook/react/pull/28150',
      head: { ref: 'fix/issue-28140-ternary-cache', sha: 'a8b7c6d5e4', label: 'dev-contributor:fix/issue-28140-ternary-cache' },
      base: { ref: 'main' },
      draft: false
    }
  ]
};

// In-memory store for user-submitted simulated PRs & issues during session
const sessionPrs: Record<string, GitHubPullRequest[]> = {};
const sessionIssues: Record<string, GitHubIssue[]> = {};

export async function fetchIssues(
  repo: string,
  state: string = 'open',
  labels?: string,
  token?: string,
  forceSandbox: boolean = false
): Promise<{ data: GitHubIssue[]; source: 'live' | 'sandbox'; error?: string }> {
  if (forceSandbox) {
    const list = [...(sessionIssues[repo] || []), ...(MOCK_ISSUES[repo] || MOCK_ISSUES['facebook/react'])];
    let filtered = list.filter(i => state === 'all' || i.state === state);
    if (labels) {
      const matchLabel = labels.toLowerCase();
      filtered = filtered.filter(i => i.labels.some(l => l.name.toLowerCase().includes(matchLabel)));
    }
    return { data: filtered, source: 'sandbox' };
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    let url = `https://api.github.com/repos/${repo}/issues?state=${state}&per_page=15`;
    if (labels) {
      url += `&labels=${encodeURIComponent(labels)}`;
    }

    const res = await fetch(url, { headers });
    if (!res.ok) {
      // Fallback to sandbox if rate-limited or repo 404
      console.warn(`GitHub API response ${res.status}, using sandbox data.`);
      const list = [...(sessionIssues[repo] || []), ...(MOCK_ISSUES[repo] || MOCK_ISSUES['facebook/react'])];
      return {
        data: list,
        source: 'sandbox',
        error: `GitHub API [${res.status}]: Using local sandbox data.`
      };
    }

    const json = await res.json();
    return { data: json, source: 'live' };
  } catch (err: any) {
    const list = [...(sessionIssues[repo] || []), ...(MOCK_ISSUES[repo] || MOCK_ISSUES['facebook/react'])];
    return {
      data: list,
      source: 'sandbox',
      error: `Network error: ${err.message}. Showing sandbox data.`
    };
  }
}

export async function fetchPullRequests(
  repo: string,
  state: string = 'open',
  token?: string,
  forceSandbox: boolean = false
): Promise<{ data: GitHubPullRequest[]; source: 'live' | 'sandbox'; error?: string }> {
  if (forceSandbox) {
    const list = [...(sessionPrs[repo] || []), ...(MOCK_PRS[repo] || MOCK_PRS['facebook/react'])];
    return { data: list.filter(pr => state === 'all' || pr.state === state), source: 'sandbox' };
  }

  try {
    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28'
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(`https://api.github.com/repos/${repo}/pulls?state=${state}&per_page=15`, { headers });
    if (!res.ok) {
      const list = [...(sessionPrs[repo] || []), ...(MOCK_PRS[repo] || MOCK_PRS['facebook/react'])];
      return {
        data: list,
        source: 'sandbox',
        error: `GitHub API [${res.status}]: Using sandbox dataset.`
      };
    }

    const json = await res.json();
    return { data: json, source: 'live' };
  } catch (err: any) {
    const list = [...(sessionPrs[repo] || []), ...(MOCK_PRS[repo] || MOCK_PRS['facebook/react'])];
    return {
      data: list,
      source: 'sandbox',
      error: `Network error: ${err.message}. Showing sandbox data.`
    };
  }
}

export async function submitPullRequest(
  repo: string,
  title: string,
  body: string,
  head: string,
  base: string = 'main',
  draft: boolean = false,
  token?: string
): Promise<{ pr: GitHubPullRequest; isLive: boolean }> {
  if (token) {
    try {
      const res = await fetch(`https://api.github.com/repos/${repo}/pulls`, {
        method: 'POST',
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ title, head, base, body, draft })
      });
      if (res.ok) {
        const pr = await res.json();
        return { pr, isLive: true };
      }
    } catch (e) {
      console.warn('Real PR submission failed, falling back to simulation', e);
    }
  }

  // Create simulated PR
  const simulatedPr: GitHubPullRequest = {
    id: Math.floor(Math.random() * 90000) + 10000,
    number: Math.floor(Math.random() * 500) + 29000,
    title,
    body,
    state: 'open',
    user: {
      login: 'you (contributor)',
      id: 99999,
      avatar_url: 'https://avatars.githubusercontent.com/u/99999?v=4',
      html_url: 'https://github.com'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    html_url: `https://github.com/${repo}/pull/${Math.floor(Math.random() * 500) + 29000}`,
    head: { ref: head, sha: 'mock-' + Math.random().toString(36).substring(7), label: head },
    base: { ref: base },
    draft
  };

  if (!sessionPrs[repo]) {
    sessionPrs[repo] = [];
  }
  sessionPrs[repo].unshift(simulatedPr);

  return { pr: simulatedPr, isLive: false };
}
