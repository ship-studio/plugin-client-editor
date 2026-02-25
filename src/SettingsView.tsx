import { useCallback } from 'react';
import type { Shell, Theme } from './types';
import { deleteAuthFile } from './auth';

interface SettingsViewProps {
  shell: Shell;
  theme: Theme;
  userEmail: string;
  onSignOut: () => void;
}

export function SettingsView({ shell, theme, userEmail, onSignOut }: SettingsViewProps) {
  const handleSignOut = useCallback(async () => {
    await deleteAuthFile(shell);
    onSignOut();
  }, [shell, onSignOut]);

  return (
    <div className="ce-body">
      <div className="ce-section">
        <div className="ce-section-title" style={{ color: theme.textMuted }}>
          Account
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: theme.textSecondary }}>{userEmail}</span>
          <button
            className="ce-btn"
            onClick={handleSignOut}
            style={{ background: `${theme.error}15`, color: theme.error }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <div className="ce-divider" />

      <div
        className="ce-empty"
        style={{ background: theme.bgTertiary, color: theme.textMuted }}
      >
        More settings coming soon.
      </div>
    </div>
  );
}
