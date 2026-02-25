import { useState, useCallback } from 'react';
import type { Shell, Theme } from './types';
import { supabaseSignIn, supabaseSignUp } from './auth';

interface AuthViewProps {
  shell: Shell;
  theme: Theme;
  onAuthSuccess: () => void;
}

export function AuthView({ shell, theme, onAuthSuccess }: AuthViewProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async () => {
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === 'signin') {
        await supabaseSignIn(shell, email, password);
      } else {
        await supabaseSignUp(shell, email, password);
      }
      onAuthSuccess();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }, [email, password, mode, shell, onAuthSuccess]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
    },
    [handleSubmit]
  );

  return (
    <div className="ce-body">
      <div className="ce-section">
        <div className="ce-section-title" style={{ color: theme.textMuted }}>
          {mode === 'signin' ? 'Sign In' : 'Sign Up'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input
            className="ce-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <input
            className="ce-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="ce-btn"
            onClick={handleSubmit}
            disabled={loading}
            style={{
              background: theme.action,
              color: theme.actionText,
              padding: '8px 16px',
            }}
          >
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up'}
          </button>
        </div>

        {error && (
          <div
            className="ce-error"
            style={{ background: `${theme.error}15`, color: theme.error }}
          >
            {error}
          </div>
        )}
      </div>

      <div style={{ textAlign: 'center', fontSize: 12 }}>
        <span style={{ color: theme.textMuted }}>
          {mode === 'signin'
            ? "Don't have an account? "
            : 'Already have an account? '}
        </span>
        <button
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin');
            setError(null);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: theme.accent,
            cursor: 'pointer',
            fontSize: 12,
            padding: 0,
          }}
        >
          {mode === 'signin' ? 'Sign Up' : 'Sign In'}
        </button>
      </div>
    </div>
  );
}
