import type { Shell, PluginStorage, ApiTarget, Invite, Member, MatchProjectResult } from './types';
import { getValidToken, deleteAuthFile } from './auth';

const API_URLS: Record<ApiTarget, string> = {
  production: 'https://agent.ship.studio',
  localhost: 'http://localhost:3000',
};

let currentApiTarget: ApiTarget = 'production';

export function getApiTarget(): ApiTarget {
  return currentApiTarget;
}

export function setApiTarget(target: ApiTarget) {
  currentApiTarget = target;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiCall<T = any>(
  shell: Shell,
  method: string,
  path: string,
  body?: unknown
): Promise<T> {
  const tokenResult = await getValidToken(shell);
  if (!tokenResult) {
    throw new Error('Not authenticated');
  }

  const baseUrl = API_URLS[currentApiTarget];
  const url = `${baseUrl}${path}`;
  const args = [
    '-sS', '-L',
    '-X', method,
    url,
    '-H', 'Content-Type: application/json',
    '-H', `Authorization: Bearer ${tokenResult.token}`,
  ];

  if (body) {
    args.push('-d', JSON.stringify(body));
  }

  const result = await shell.exec('curl', args);

  if (!result.stdout.trim()) {
    if (result.exit_code !== 0) {
      const detail = result.stderr?.trim() || `exit ${result.exit_code}`;
      throw new Error(`${method} ${url} failed: ${detail}`);
    }
    return {} as T;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let data: any;
  try {
    data = JSON.parse(result.stdout);
  } catch {
    throw new Error(`Invalid response: ${result.stdout.slice(0, 200)}`);
  }

  if (data.error) {
    if (data.error === 'Unauthorized' || data.statusCode === 401) {
      await deleteAuthFile(shell);
      throw new Error('Session expired. Please sign in again.');
    }
    throw new Error(data.error?.message || data.error || 'Request failed');
  }

  return data as T;
}

interface ProjectResponse {
  id: string;
  githubRepoFullName: string;
  name: string;
  role: string;
  isBillingOwner: boolean;
  active: boolean;
}

export async function fetchProjects(shell: Shell): Promise<ProjectResponse[]> {
  const data = await apiCall<{ projects: ProjectResponse[] }>(shell, 'GET', '/api/me/projects');
  return data.projects;
}

interface ProjectSettingsResponse {
  pendingInvites: Invite[];
  members: Member[];
}

export async function fetchProjectSettings(
  shell: Shell,
  projectId: string
): Promise<ProjectSettingsResponse> {
  const data = await apiCall<{ team: { members: Member[]; pendingInvites: Invite[] } }>(
    shell,
    'GET',
    `/api/projects/${projectId}/settings`
  );
  return { members: data.team.members, pendingInvites: data.team.pendingInvites };
}

export async function inviteClient(
  shell: Shell,
  projectId: string,
  email: string,
  role: string
): Promise<void> {
  await apiCall(shell, 'POST', `/api/projects/${projectId}/invite`, { email, role });
}

export async function cancelInvite(
  shell: Shell,
  projectId: string,
  inviteId: string
): Promise<void> {
  await apiCall(shell, 'DELETE', `/api/projects/${projectId}/invites/${inviteId}`);
}

export async function removeMember(
  shell: Shell,
  projectId: string,
  userId: string
): Promise<void> {
  await apiCall(shell, 'DELETE', `/api/projects/${projectId}/members/${userId}`);
}

export function parseGitRemote(url: string): string | null {
  // SSH: git@github.com:owner/repo.git
  const sshMatch = url.match(/git@github\.com:(.+?\/.+?)(?:\.git)?$/);
  if (sshMatch) return sshMatch[1];

  // HTTPS: https://github.com/owner/repo.git
  const httpsMatch = url.match(/github\.com\/(.+?\/.+?)(?:\.git)?$/);
  if (httpsMatch) return httpsMatch[1];

  return null;
}

export async function clearProjectCache(storage: PluginStorage): Promise<void> {
  const stored = await storage.read();
  delete stored.projectId;
  delete stored.repoFullName;
  await storage.write(stored);
}

/**
 * Check if the GitHub App is installed for a repo and get/create the project.
 * Expects: GET /api/github/check-repo/:owner/:repo
 * Returns: { installed: true, projectId: "..." } or { installed: false }
 */
interface CheckRepoResponse {
  installed: boolean;
  projectId?: string;
}

export async function checkRepo(
  shell: Shell,
  repoFullName: string
): Promise<CheckRepoResponse> {
  const [owner, repo] = repoFullName.split('/');
  try {
    return await apiCall<CheckRepoResponse>(
      shell,
      'GET',
      `/api/github/check-repo/${owner}/${repo}`
    );
  } catch (err) {
    // 404 / "Not Found" means the app isn't installed (or endpoint not deployed yet)
    if (err instanceof Error && /not found/i.test(err.message)) {
      return { installed: false };
    }
    throw err;
  }
}

export async function getRepoFullName(shell: Shell): Promise<string> {
  const remoteResult = await shell.exec('git', ['remote', 'get-url', 'origin']);
  if (remoteResult.exit_code !== 0) {
    throw new Error('No git remote found. Make sure this project has an "origin" remote.');
  }

  const rawRemote = remoteResult.stdout.trim();
  const repoFullName = parseGitRemote(rawRemote);
  if (!repoFullName) {
    throw new Error(`Could not parse GitHub owner/repo from remote: ${rawRemote}`);
  }

  return repoFullName;
}

export async function matchProject(
  shell: Shell,
  storage: PluginStorage
): Promise<MatchProjectResult> {
  // Check cache first
  const stored = await storage.read();
  if (stored.projectId && stored.repoFullName) {
    return {
      status: 'matched',
      projectId: stored.projectId as string,
      repoFullName: stored.repoFullName as string,
    };
  }

  const repoFullName = await getRepoFullName(shell);

  // check-repo: checks GitHub App installation, auto-creates project, adds dev as member
  const check = await checkRepo(shell, repoFullName);
  if (check.installed && check.projectId) {
    await storage.write({ ...stored, projectId: check.projectId, repoFullName });
    return { status: 'matched', projectId: check.projectId, repoFullName };
  }

  return { status: 'not_found', repoFullName };
}

export function getGitHubInstallUrl(): string {
  const baseUrl = API_URLS[currentApiTarget];
  return `${baseUrl}/api/github/install`;
}

export async function pollForProject(
  shell: Shell,
  repoFullName: string,
  storage: PluginStorage
): Promise<{ projectId: string } | null> {
  const check = await checkRepo(shell, repoFullName);
  if (!check.installed || !check.projectId) return null;

  const stored = await storage.read();
  await storage.write({ ...stored, projectId: check.projectId, repoFullName });
  return { projectId: check.projectId };
}
