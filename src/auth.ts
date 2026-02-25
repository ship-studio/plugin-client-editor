import type { AuthState, Shell } from './types';

const SUPABASE_URL = 'https://tdaxnnwkwdtaiunkyzlf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_StH89Ew68PdRJ93Pry2qEw_Sma2OzYp';
const AUTH_DIR = '.shipstudio/plugins/client-editor';
const AUTH_FILE = `${AUTH_DIR}/auth.json`;

let cachedHomePath: string | null = null;

async function getHomePath(shell: Shell): Promise<string> {
  if (cachedHomePath) return cachedHomePath;
  const result = await shell.exec('sh', ['-c', 'echo $HOME']);
  cachedHomePath = result.stdout.trim();
  return cachedHomePath;
}

export async function readAuthFile(shell: Shell): Promise<AuthState | null> {
  try {
    const home = await getHomePath(shell);
    const result = await shell.exec('cat', [`${home}/${AUTH_FILE}`]);
    if (result.exit_code !== 0) return null;
    return JSON.parse(result.stdout) as AuthState;
  } catch {
    return null;
  }
}

export async function writeAuthFile(shell: Shell, state: AuthState): Promise<void> {
  const home = await getHomePath(shell);
  await shell.exec('mkdir', ['-p', `${home}/${AUTH_DIR}`]);
  const b64 = btoa(JSON.stringify(state));
  await shell.exec('sh', ['-c', `echo '${b64}' | base64 -d > "${home}/${AUTH_FILE}"`]);
}

export async function deleteAuthFile(shell: Shell): Promise<void> {
  const home = await getHomePath(shell);
  await shell.exec('rm', ['-f', `${home}/${AUTH_FILE}`]);
}

export async function supabaseSignIn(
  shell: Shell,
  email: string,
  password: string
): Promise<AuthState> {
  const result = await shell.exec('curl', [
    '-s',
    '-X', 'POST',
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    '-H', 'Content-Type: application/json',
    '-H', `apikey: ${SUPABASE_ANON_KEY}`,
    '-d', JSON.stringify({ email, password }),
  ]);

  const data = JSON.parse(result.stdout);
  if (data.error || data.error_description) {
    throw new Error(data.error_description || data.error || 'Sign in failed');
  }

  const state: AuthState = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    user_email: data.user?.email || email,
  };

  await writeAuthFile(shell, state);
  return state;
}

export async function supabaseSignUp(
  shell: Shell,
  email: string,
  password: string
): Promise<AuthState> {
  const result = await shell.exec('curl', [
    '-s',
    '-X', 'POST',
    `${SUPABASE_URL}/auth/v1/signup`,
    '-H', 'Content-Type: application/json',
    '-H', `apikey: ${SUPABASE_ANON_KEY}`,
    '-d', JSON.stringify({ email, password }),
  ]);

  const data = JSON.parse(result.stdout);
  if (data.error || data.error_description) {
    throw new Error(data.error_description || data.error || 'Sign up failed');
  }

  if (!data.access_token) {
    throw new Error('Check your email to confirm your account, then sign in.');
  }

  const state: AuthState = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    user_email: data.user?.email || email,
  };

  await writeAuthFile(shell, state);
  return state;
}

async function supabaseRefreshToken(shell: Shell, refreshToken: string): Promise<AuthState> {
  const result = await shell.exec('curl', [
    '-s',
    '-X', 'POST',
    `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    '-H', 'Content-Type: application/json',
    '-H', `apikey: ${SUPABASE_ANON_KEY}`,
    '-d', JSON.stringify({ refresh_token: refreshToken }),
  ]);

  const data = JSON.parse(result.stdout);
  if (data.error || data.error_description) {
    throw new Error(data.error_description || data.error || 'Token refresh failed');
  }

  const state: AuthState = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + data.expires_in,
    user_email: data.user?.email || '',
  };

  await writeAuthFile(shell, state);
  return state;
}

export async function getValidToken(
  shell: Shell
): Promise<{ token: string; auth: AuthState } | null> {
  const auth = await readAuthFile(shell);
  if (!auth) return null;

  const now = Math.floor(Date.now() / 1000);
  if (auth.expires_at - now > 60) {
    return { token: auth.access_token, auth };
  }

  try {
    const refreshed = await supabaseRefreshToken(shell, auth.refresh_token);
    return { token: refreshed.access_token, auth: refreshed };
  } catch {
    await deleteAuthFile(shell);
    return null;
  }
}
