export interface Shell {
  exec: (
    command: string,
    args: string[],
    options?: { timeout?: number }
  ) => Promise<{
    stdout: string;
    stderr: string;
    exit_code: number;
  }>;
}

export interface PluginStorage {
  read: () => Promise<Record<string, unknown>>;
  write: (data: Record<string, unknown>) => Promise<void>;
}

export interface Theme {
  bgPrimary: string;
  bgSecondary: string;
  bgTertiary: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  accent: string;
  accentHover: string;
  action: string;
  actionHover: string;
  actionText: string;
  error: string;
  success: string;
}

export interface PluginContextValue {
  pluginId: string;
  project: {
    name: string;
    path: string;
    currentBranch: string;
    hasUncommittedChanges: boolean;
  } | null;
  actions: {
    showToast: (message: string, type?: 'success' | 'error') => void;
    refreshGitStatus: () => void;
    refreshBranches: () => void;
    focusTerminal: () => void;
    openUrl: (url: string) => void;
  };
  shell: Shell;
  storage: PluginStorage;
  invoke: {
    call: <T = unknown>(command: string, args?: Record<string, unknown>) => Promise<T>;
  };
  theme: Theme;
}

export interface AuthState {
  access_token: string;
  refresh_token: string;
  expires_at: number;
  user_email: string;
}

export interface Invite {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface Member {
  userId: string;
  email: string;
  role: string;
  isBillingOwner: boolean;
  joinedAt: string;
}

export interface ProjectMatched {
  status: 'matched';
  projectId: string;
  repoFullName: string;
}

export interface ProjectNotFound {
  status: 'not_found';
  repoFullName: string;
}

export type MatchProjectResult = ProjectMatched | ProjectNotFound;

export type ApiTarget = 'production' | 'localhost';

export type ModalView = 'auth' | 'main' | 'settings';
