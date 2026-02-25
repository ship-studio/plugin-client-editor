import { useState, useCallback, useEffect, useRef } from 'react';
import type { Shell, Theme, PluginStorage, Invite, Member } from './types';
import {
  fetchProjectSettings,
  inviteClient,
  matchProject,
  clearProjectCache,
  getGitHubInstallUrl,
  pollForProject,
} from './api';

interface MainViewProps {
  shell: Shell;
  theme: Theme;
  storage: PluginStorage;
  showToast: (message: string, type?: 'success' | 'error') => void;
  openUrl: (url: string) => void;
}

export function MainView({ shell, theme, storage, showToast, openUrl }: MainViewProps) {
  const [projectId, setProjectId] = useState<string | null>(null);
  const [repoFullName, setRepoFullName] = useState<string | null>(null);
  const [owner, setOwner] = useState<Member | null>(null);
  const [pendingInvite, setPendingInvite] = useState<Invite | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [needsGitHubInstall, setNeedsGitHubInstall] = useState(false);
  const [waitingForInstall, setWaitingForInstall] = useState(false);
  const didLoad = useRef(false);

  // Invite form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);

  // Stable refs
  const shellRef = useRef(shell);
  shellRef.current = shell;
  const storageRef = useRef(storage);
  storageRef.current = storage;
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const openUrlRef = useRef(openUrl);
  openUrlRef.current = openUrl;
  const retriedRef = useRef(false);

  const tryLoadSettings = useCallback(async (pid: string) => {
    try {
      const settings = await fetchProjectSettings(shellRef.current, pid);
      const billingOwner = (settings.members || []).find((m) => m.isBillingOwner);
      setOwner(billingOwner || null);
      const invite = (settings.pendingInvites || [])[0] || null;
      setPendingInvite(invite);
    } catch {
      // Developer can't view settings until billing owner exists — that's OK
      setOwner(null);
      setPendingInvite(null);
    }
  }, []);

  const loadProject = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNeedsGitHubInstall(false);
    try {
      const match = await matchProject(shellRef.current, storageRef.current);
      if (match.status === 'not_found') {
        setRepoFullName(match.repoFullName);
        setNeedsGitHubInstall(true);
        return;
      }
      setProjectId(match.projectId);
      setRepoFullName(match.repoFullName);
      await tryLoadSettings(match.projectId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load project';
      if (!retriedRef.current && /not a member|forbidden|not authorized/i.test(msg)) {
        retriedRef.current = true;
        await clearProjectCache(storageRef.current);
        return loadProject();
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [tryLoadSettings]);

  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    loadProject();
  }, [loadProject]);

  const handleConnectGitHub = useCallback(() => {
    openUrlRef.current(getGitHubInstallUrl());
    setWaitingForInstall(true);
  }, []);

  // Poll for project after GitHub App install
  useEffect(() => {
    if (!waitingForInstall || !repoFullName) return;
    const interval = setInterval(async () => {
      try {
        const result = await pollForProject(shellRef.current, repoFullName, storageRef.current);
        if (result) {
          setProjectId(result.projectId);
          setNeedsGitHubInstall(false);
          setWaitingForInstall(false);
          await tryLoadSettings(result.projectId);
          showToastRef.current('Project connected!', 'success');
        }
      } catch {
        // Ignore polling errors — will retry on next interval
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [waitingForInstall, repoFullName, tryLoadSettings]);

  const handleInvite = useCallback(async () => {
    if (!projectId || !inviteEmail) return;
    setInviting(true);
    try {
      await inviteClient(shellRef.current, projectId, inviteEmail, 'owner');
      showToastRef.current(`Invited ${inviteEmail} as owner`, 'success');
      setInviteEmail('');
      await tryLoadSettings(projectId);
    } catch (err: unknown) {
      showToastRef.current(
        err instanceof Error ? err.message : 'Failed to invite',
        'error'
      );
    } finally {
      setInviting(false);
    }
  }, [projectId, inviteEmail, tryLoadSettings]);

  if (loading) {
    return (
      <div className="ce-body">
        <div style={{ textAlign: 'center', color: theme.textMuted, padding: 20 }}>
          Loading project...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ce-body">
        <div>
          <div
            className="ce-error"
            style={{ background: `${theme.error}15`, color: theme.error }}
          >
            {error}
          </div>
          <button
            className="ce-btn"
            onClick={loadProject}
            style={{ background: theme.bgTertiary, color: theme.textPrimary, marginTop: 12 }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // GitHub App not installed for this repo
  if (needsGitHubInstall) {
    return (
      <div className="ce-body">
        <div>
          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 16 }}>
            Repository: <span style={{ color: theme.accent }}>{repoFullName}</span>
          </div>
          {!waitingForInstall ? (
            <>
              <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 12 }}>
                This repository isn't connected to Ship Studio yet. Install the GitHub App to
                connect it.
              </div>
              <button
                className="ce-btn"
                onClick={handleConnectGitHub}
                style={{ background: theme.action, color: theme.actionText, width: '100%' }}
              >
                Install GitHub App
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: 12, color: theme.textSecondary, marginBottom: 12 }}>
                Waiting for GitHub App installation...
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  className="ce-btn"
                  onClick={handleConnectGitHub}
                  style={{ background: theme.bgTertiary, color: theme.textPrimary, flex: 1 }}
                >
                  Open GitHub Again
                </button>
                <button
                  className="ce-btn"
                  onClick={async () => {
                    if (!repoFullName) return;
                    try {
                      const result = await pollForProject(shell, repoFullName, storage);
                      if (result) {
                        setProjectId(result.projectId);
                        setNeedsGitHubInstall(false);
                        setWaitingForInstall(false);
                        await tryLoadSettings(result.projectId);
                        showToast('Project connected!', 'success');
                      } else {
                        showToast('Not found yet — keep waiting', 'error');
                      }
                    } catch {
                      showToast('Check failed — will keep polling', 'error');
                    }
                  }}
                  style={{ background: theme.bgTertiary, color: theme.textPrimary, flex: 1 }}
                >
                  Check Now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Owner already exists
  if (owner) {
    return (
      <div className="ce-body">
        <div>
          <div className="ce-section">
            <div style={{ fontSize: 12, color: theme.textMuted }}>
              Project: <span style={{ color: theme.accent }}>{repoFullName}</span>
            </div>
          </div>
          <div className="ce-section">
            <div className="ce-section-title" style={{ color: theme.textMuted }}>
              Client (Owner)
            </div>
            <div className="ce-row" style={{ background: theme.bgTertiary }}>
              <span style={{ color: theme.textPrimary }}>{owner.email}</span>
              <span
                className="ce-badge"
                style={{ background: `${theme.success}20`, color: theme.success }}
              >
                Active
              </span>
            </div>
          </div>
          <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 4 }}>
            If your client has lost access, please contact Ship Studio support.
          </div>
        </div>
      </div>
    );
  }

  // Pending invite exists
  if (pendingInvite) {
    return (
      <div className="ce-body">
        <div>
          <div className="ce-section">
            <div style={{ fontSize: 12, color: theme.textMuted }}>
              Project: <span style={{ color: theme.accent }}>{repoFullName}</span>
            </div>
          </div>
          <div className="ce-section">
            <div className="ce-section-title" style={{ color: theme.textMuted }}>
              Pending Owner Invite
            </div>
            <div className="ce-row" style={{ background: theme.bgTertiary }}>
              <span style={{ color: theme.textPrimary }}>{pendingInvite.email}</span>
              <span
                className="ce-badge"
                style={{ background: `${theme.accent}20`, color: theme.accent }}
              >
                Pending
              </span>
            </div>
            <div style={{ fontSize: 11, color: theme.textMuted, marginTop: 8 }}>
              Waiting for them to accept the invite and set up billing.
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No owner, no invite — show invite form
  return (
    <div className="ce-body">
      <div>
        <div className="ce-section">
          <div style={{ fontSize: 12, color: theme.textMuted }}>
            Project: <span style={{ color: theme.accent }}>{repoFullName}</span>
          </div>
        </div>
        <div className="ce-section">
          <div className="ce-section-title" style={{ color: theme.textMuted }}>
            Invite Client as Owner
          </div>
          <div style={{ fontSize: 12, color: theme.textMuted, marginBottom: 10 }}>
            The client will become the billing owner for this project.
          </div>
          <div className="ce-form-row">
            <input
              className="ce-input"
              type="email"
              placeholder="client@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleInvite(); }}
              style={{ flex: 1 }}
            />
            <button
              className="ce-btn"
              onClick={handleInvite}
              disabled={inviting || !inviteEmail}
              style={{ background: theme.action, color: theme.actionText, whiteSpace: 'nowrap' }}
            >
              {inviting ? '...' : 'Invite'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
