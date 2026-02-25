import { useState, useEffect, useCallback } from 'react';
import type { AuthState, ModalView } from './types';
import { usePluginContext } from './context';
import { readAuthFile } from './auth';
import { AuthView } from './AuthView';
import { MainView } from './MainView';
import { SettingsView } from './SettingsView';

export function Modal({ onClose }: { onClose: () => void }) {
  const ctx = usePluginContext();
  if (!ctx) return <span />;
  const { shell, theme, storage, actions } = ctx;

  const [view, setView] = useState<ModalView>('auth');
  const [auth, setAuth] = useState<AuthState | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth on mount
  useEffect(() => {
    readAuthFile(shell).then((a) => {
      if (a) {
        setAuth(a);
        setView('main');
      }
      setLoading(false);
    });
  }, [shell]);

  // Escape to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleAuthSuccess = useCallback(async () => {
    const a = await readAuthFile(shell);
    if (a) {
      setAuth(a);
      setView('main');
    }
  }, [shell]);

  const handleSignOut = useCallback(() => {
    setAuth(null);
    setView('auth');
  }, []);

  return (
    <div className="ce-overlay" onClick={onClose}>
      <div
        className="ce-modal"
        style={{
          background: theme.bgPrimary,
          color: theme.textPrimary,
          border: `1px solid ${theme.border}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="ce-header"
          style={{ borderBottom: `1px solid ${theme.border}` }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>Client Editor</span>
            {auth && (
              <div className="ce-tabs">
                <button
                  className="ce-tab"
                  onClick={() => setView('main')}
                  style={{
                    color: view === 'main' ? theme.textPrimary : theme.textMuted,
                    background: view === 'main' ? theme.bgTertiary : 'transparent',
                  }}
                >
                  Clients
                </button>
                <button
                  className="ce-tab"
                  onClick={() => setView('settings')}
                  style={{
                    color: view === 'settings' ? theme.textPrimary : theme.textMuted,
                    background: view === 'settings' ? theme.bgTertiary : 'transparent',
                  }}
                >
                  Settings
                </button>
              </div>
            )}
          </div>
          <button
            className="ce-btn"
            onClick={onClose}
            style={{ background: theme.bgTertiary, color: theme.textSecondary }}
          >
            Close
          </button>
        </div>

        {/* Body */}
        {loading ? (
          <div
            className="ce-body"
            style={{ textAlign: 'center', color: theme.textMuted, padding: 40 }}
          >
            Loading...
          </div>
        ) : view === 'auth' ? (
          <AuthView shell={shell} theme={theme} onAuthSuccess={handleAuthSuccess} />
        ) : view === 'settings' ? (
          <SettingsView
            shell={shell}
            theme={theme}
            userEmail={auth?.user_email || ''}
            onSignOut={handleSignOut}
          />
        ) : (
          <MainView
            shell={shell}
            theme={theme}
            storage={storage}
            showToast={actions.showToast}
            openUrl={actions.openUrl}
          />
        )}
      </div>
    </div>
  );
}
