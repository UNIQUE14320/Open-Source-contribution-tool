export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
}

export interface GitHubLabel {
  id: number;
  name: string;
  color: string;
  description?: string;
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed';
  user: GitHubUser;
  labels: GitHubLabel[];
  comments: number;
  created_at: string;
  updated_at: string;
  html_url: string;
  pull_request?: {
    url: string;
    html_url: string;
  };
}

export interface GitHubPullRequest {
  id: number;
  number: number;
  title: string;
  body: string | null;
  state: 'open' | 'closed' | 'merged';
  user: GitHubUser;
  created_at: string;
  updated_at: string;
  html_url: string;
  head: {
    ref: string;
    sha: string;
    label: string;
  };
  base: {
    ref: string;
  };
  draft: boolean;
  merged?: boolean;
}

export interface MavenProjectFile {
  path: string;
  name: string;
  category: 'config' | 'source' | 'model' | 'command' | 'test' | 'doc';
  language: 'xml' | 'java' | 'markdown' | 'json';
  content: string;
  description: string;
}

export interface CliConfig {
  githubToken: string;
  defaultRepo: string;
  authorName: string;
  authorEmail: string;
  useLiveApi: boolean;
  restEndpoint: string;
}

export interface CommandLog {
  id: string;
  timestamp: string;
  command: string;
  output: string;
  type: 'info' | 'success' | 'error' | 'warning' | 'table';
  structuredData?: any;
}
