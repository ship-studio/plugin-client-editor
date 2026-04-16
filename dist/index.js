import { jsxs, jsx, Fragment } from "data:text/javascript,export const jsx=window.__SHIPSTUDIO_REACT__.createElement;export const jsxs=window.__SHIPSTUDIO_REACT__.createElement;export const Fragment=window.__SHIPSTUDIO_REACT__.Fragment;";
import { useEffect, useState, useCallback, useRef } from "data:text/javascript,export default window.__SHIPSTUDIO_REACT__;export const useState=window.__SHIPSTUDIO_REACT__.useState;export const useEffect=window.__SHIPSTUDIO_REACT__.useEffect;export const useCallback=window.__SHIPSTUDIO_REACT__.useCallback;export const useMemo=window.__SHIPSTUDIO_REACT__.useMemo;export const useRef=window.__SHIPSTUDIO_REACT__.useRef;export const useContext=window.__SHIPSTUDIO_REACT__.useContext;export const createElement=window.__SHIPSTUDIO_REACT__.createElement;export const Fragment=window.__SHIPSTUDIO_REACT__.Fragment;";
const _w = window;
function usePluginContext() {
  const React = _w.__SHIPSTUDIO_REACT__;
  const CtxRef = _w.__SHIPSTUDIO_PLUGIN_CONTEXT_REF__;
  if (CtxRef && (React == null ? void 0 : React.useContext)) {
    const ctx = React.useContext(CtxRef);
    if (ctx) return ctx;
  }
  const directCtx = _w.__SHIPSTUDIO_PLUGIN_CONTEXT__;
  if (directCtx) return directCtx;
  return null;
}
const STYLE_ID = "ce-plugin-styles";
const pluginCSS = `
.ce-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
}
.ce-modal {
  width: 480px;
  max-height: 80vh;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}
.ce-header {
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.ce-tabs {
  display: flex;
  gap: 0;
}
.ce-tab {
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  border-radius: 6px;
  transition: background 0.15s;
}
.ce-tab:hover {
  opacity: 0.8;
}
.ce-body {
  padding: 20px;
  overflow-y: auto;
  font-size: 13px;
  line-height: 1.5;
  display: flex;
  flex-direction: column;
}
.ce-section {
  margin-bottom: 16px;
}
.ce-section-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
}
.ce-input {
  width: 100%;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
}
.ce-input:focus {
  border-color: var(--accent);
}
.ce-select {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 13px;
  outline: none;
}
.ce-btn {
  padding: 6px 12px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-size: 12px;
  font-weight: 500;
  transition: opacity 0.15s;
}
.ce-btn:hover {
  opacity: 0.85;
}
.ce-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.ce-error {
  font-size: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  margin-top: 8px;
}
.ce-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
}
.ce-row + .ce-row {
  margin-top: 4px;
}
.ce-badge {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 4px;
}
.ce-form-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.ce-radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.ce-radio-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  cursor: pointer;
}
.ce-divider {
  height: 1px;
  background: var(--border);
  margin: 16px 0;
}
.ce-empty {
  font-size: 12px;
  padding: 12px;
  text-align: center;
  border-radius: 6px;
}
`;
function useInjectStyles() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = pluginCSS;
    document.head.appendChild(style);
    return () => {
      var _a;
      (_a = document.getElementById(STYLE_ID)) == null ? void 0 : _a.remove();
    };
  }, []);
}
const SUPABASE_URL = "https://tdaxnnwkwdtaiunkyzlf.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_StH89Ew68PdRJ93Pry2qEw_Sma2OzYp";
const AUTH_DIR = ".shipstudio/plugins/client-editor";
const AUTH_FILE = `${AUTH_DIR}/auth.json`;
let cachedHomePath = null;
async function getHomePath(shell) {
  if (cachedHomePath) return cachedHomePath;
  const result = await shell.exec("sh", ["-c", "echo $HOME"]);
  cachedHomePath = result.stdout.trim();
  return cachedHomePath;
}
async function readAuthFile(shell) {
  try {
    const home = await getHomePath(shell);
    const result = await shell.exec("cat", [`${home}/${AUTH_FILE}`]);
    if (result.exit_code !== 0) return null;
    return JSON.parse(result.stdout);
  } catch {
    return null;
  }
}
async function writeAuthFile(shell, state) {
  const home = await getHomePath(shell);
  await shell.exec("mkdir", ["-p", `${home}/${AUTH_DIR}`]);
  const b64 = btoa(JSON.stringify(state));
  await shell.exec("sh", ["-c", `echo '${b64}' | base64 -d > "${home}/${AUTH_FILE}"`]);
}
async function deleteAuthFile(shell) {
  const home = await getHomePath(shell);
  await shell.exec("rm", ["-f", `${home}/${AUTH_FILE}`]);
}
async function supabaseSignIn(shell, email, password) {
  var _a;
  const result = await shell.exec("curl", [
    "-s",
    "-X",
    "POST",
    `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
    "-H",
    "Content-Type: application/json",
    "-H",
    `apikey: ${SUPABASE_ANON_KEY}`,
    "-d",
    JSON.stringify({ email, password })
  ]);
  const data = JSON.parse(result.stdout);
  if (data.error || data.error_description) {
    throw new Error(data.error_description || data.error || "Sign in failed");
  }
  const state = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1e3) + data.expires_in,
    user_email: ((_a = data.user) == null ? void 0 : _a.email) || email
  };
  await writeAuthFile(shell, state);
  return state;
}
async function supabaseSignUp(shell, email, password) {
  var _a;
  const result = await shell.exec("curl", [
    "-s",
    "-X",
    "POST",
    `${SUPABASE_URL}/auth/v1/signup`,
    "-H",
    "Content-Type: application/json",
    "-H",
    `apikey: ${SUPABASE_ANON_KEY}`,
    "-d",
    JSON.stringify({ email, password })
  ]);
  const data = JSON.parse(result.stdout);
  if (data.error || data.error_description) {
    throw new Error(data.error_description || data.error || "Sign up failed");
  }
  if (!data.access_token) {
    throw new Error("Check your email to confirm your account, then sign in.");
  }
  const state = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1e3) + data.expires_in,
    user_email: ((_a = data.user) == null ? void 0 : _a.email) || email
  };
  await writeAuthFile(shell, state);
  return state;
}
async function supabaseRefreshToken(shell, refreshToken) {
  var _a;
  const result = await shell.exec("curl", [
    "-s",
    "-X",
    "POST",
    `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    "-H",
    "Content-Type: application/json",
    "-H",
    `apikey: ${SUPABASE_ANON_KEY}`,
    "-d",
    JSON.stringify({ refresh_token: refreshToken })
  ]);
  const data = JSON.parse(result.stdout);
  if (data.error || data.error_description) {
    throw new Error(data.error_description || data.error || "Token refresh failed");
  }
  const state = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1e3) + data.expires_in,
    user_email: ((_a = data.user) == null ? void 0 : _a.email) || ""
  };
  await writeAuthFile(shell, state);
  return state;
}
async function getValidToken(shell) {
  const auth = await readAuthFile(shell);
  if (!auth) return null;
  const now = Math.floor(Date.now() / 1e3);
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
function AuthView({ shell, theme, onAuthSuccess }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = useCallback(async () => {
    if (!email || !password) {
      setError("Email and password are required");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      if (mode === "signin") {
        await supabaseSignIn(shell, email, password);
      } else {
        await supabaseSignUp(shell, email, password);
      }
      onAuthSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  }, [email, password, mode, shell, onAuthSuccess]);
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter") handleSubmit();
    },
    [handleSubmit]
  );
  return /* @__PURE__ */ jsxs("div", { className: "ce-body", children: [
    /* @__PURE__ */ jsxs("div", { className: "ce-section", children: [
      /* @__PURE__ */ jsx("div", { className: "ce-section-title", style: { color: theme.textMuted }, children: mode === "signin" ? "Sign In" : "Sign Up" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", gap: 10 }, children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "ce-input",
            type: "email",
            placeholder: "Email",
            value: email,
            onChange: (e) => setEmail(e.target.value),
            onKeyDown: handleKeyDown,
            autoFocus: true
          }
        ),
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "ce-input",
            type: "password",
            placeholder: "Password",
            value: password,
            onChange: (e) => setPassword(e.target.value),
            onKeyDown: handleKeyDown
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "ce-btn",
            onClick: handleSubmit,
            disabled: loading,
            style: {
              background: theme.action,
              color: theme.actionText,
              padding: "8px 16px"
            },
            children: loading ? "Loading..." : mode === "signin" ? "Sign In" : "Sign Up"
          }
        )
      ] }),
      error && /* @__PURE__ */ jsx(
        "div",
        {
          className: "ce-error",
          style: { background: `${theme.error}15`, color: theme.error },
          children: error
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { style: { textAlign: "center", fontSize: 12 }, children: [
      /* @__PURE__ */ jsx("span", { style: { color: theme.textMuted }, children: mode === "signin" ? "Don't have an account? " : "Already have an account? " }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          },
          style: {
            background: "none",
            border: "none",
            color: theme.accent,
            cursor: "pointer",
            fontSize: 12,
            padding: 0
          },
          children: mode === "signin" ? "Sign Up" : "Sign In"
        }
      )
    ] })
  ] });
}
const API_URLS = {
  production: "https://agent.ship.studio",
  localhost: "http://localhost:3000"
};
let currentApiTarget = "production";
async function apiCall(shell, method, path, body) {
  var _a, _b;
  const tokenResult = await getValidToken(shell);
  if (!tokenResult) {
    throw new Error("Not authenticated");
  }
  const baseUrl = API_URLS[currentApiTarget];
  const url = `${baseUrl}${path}`;
  const args = [
    "-sS",
    "-L",
    "-X",
    method,
    url,
    "-H",
    "Content-Type: application/json",
    "-H",
    `Authorization: Bearer ${tokenResult.token}`
  ];
  if (body) {
    args.push("-d", JSON.stringify(body));
  }
  const result = await shell.exec("curl", args);
  if (!result.stdout.trim()) {
    if (result.exit_code !== 0) {
      const detail = ((_a = result.stderr) == null ? void 0 : _a.trim()) || `exit ${result.exit_code}`;
      throw new Error(`${method} ${url} failed: ${detail}`);
    }
    return {};
  }
  let data;
  try {
    data = JSON.parse(result.stdout);
  } catch {
    throw new Error(`Invalid response: ${result.stdout.slice(0, 200)}`);
  }
  if (data.error) {
    if (data.error === "Unauthorized" || data.statusCode === 401) {
      await deleteAuthFile(shell);
      throw new Error("Session expired. Please sign in again.");
    }
    throw new Error(((_b = data.error) == null ? void 0 : _b.message) || data.error || "Request failed");
  }
  return data;
}
async function fetchProjectSettings(shell, projectId) {
  const data = await apiCall(
    shell,
    "GET",
    `/api/projects/${projectId}/settings`
  );
  return { members: data.team.members, pendingInvites: data.team.pendingInvites };
}
async function inviteClient(shell, projectId, email, role) {
  await apiCall(shell, "POST", `/api/projects/${projectId}/invite`, { email, role });
}
function parseGitRemote(url) {
  const sshMatch = url.match(/git@github\.com:(.+?\/.+?)(?:\.git)?$/);
  if (sshMatch) return sshMatch[1];
  const httpsMatch = url.match(/github\.com\/(.+?\/.+?)(?:\.git)?$/);
  if (httpsMatch) return httpsMatch[1];
  return null;
}
async function clearProjectCache(storage) {
  const stored = await storage.read();
  delete stored.projectId;
  delete stored.repoFullName;
  await storage.write(stored);
}
async function checkRepo(shell, repoFullName) {
  const [owner, repo] = repoFullName.split("/");
  try {
    return await apiCall(
      shell,
      "GET",
      `/api/github/check-repo/${owner}/${repo}`
    );
  } catch (err) {
    if (err instanceof Error && /not found/i.test(err.message)) {
      return { installed: false };
    }
    throw err;
  }
}
async function getRepoFullName(shell) {
  const remoteResult = await shell.exec("git", ["remote", "get-url", "origin"]);
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
async function matchProject(shell, storage) {
  const stored = await storage.read();
  if (stored.projectId && stored.repoFullName) {
    return {
      status: "matched",
      projectId: stored.projectId,
      repoFullName: stored.repoFullName
    };
  }
  const repoFullName = await getRepoFullName(shell);
  const check = await checkRepo(shell, repoFullName);
  if (check.installed && check.projectId) {
    await storage.write({ ...stored, projectId: check.projectId, repoFullName });
    return { status: "matched", projectId: check.projectId, repoFullName };
  }
  return { status: "not_found", repoFullName };
}
function getGitHubInstallUrl() {
  const baseUrl = API_URLS[currentApiTarget];
  return `${baseUrl}/api/github/install`;
}
async function pollForProject(shell, repoFullName, storage) {
  const check = await checkRepo(shell, repoFullName);
  if (!check.installed || !check.projectId) return null;
  const stored = await storage.read();
  await storage.write({ ...stored, projectId: check.projectId, repoFullName });
  return { projectId: check.projectId };
}
function MainView({ shell, theme, storage, showToast, openUrl }) {
  const [projectId, setProjectId] = useState(null);
  const [repoFullName, setRepoFullName] = useState(null);
  const [owner, setOwner] = useState(null);
  const [pendingInvite, setPendingInvite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsGitHubInstall, setNeedsGitHubInstall] = useState(false);
  const [waitingForInstall, setWaitingForInstall] = useState(false);
  const didLoad = useRef(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const shellRef = useRef(shell);
  shellRef.current = shell;
  const storageRef = useRef(storage);
  storageRef.current = storage;
  const showToastRef = useRef(showToast);
  showToastRef.current = showToast;
  const openUrlRef = useRef(openUrl);
  openUrlRef.current = openUrl;
  const retriedRef = useRef(false);
  const tryLoadSettings = useCallback(async (pid) => {
    try {
      const settings = await fetchProjectSettings(shellRef.current, pid);
      const billingOwner = (settings.members || []).find((m) => m.isBillingOwner);
      setOwner(billingOwner || null);
      const invite = (settings.pendingInvites || [])[0] || null;
      setPendingInvite(invite);
    } catch {
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
      if (match.status === "not_found") {
        setRepoFullName(match.repoFullName);
        setNeedsGitHubInstall(true);
        return;
      }
      setProjectId(match.projectId);
      setRepoFullName(match.repoFullName);
      await tryLoadSettings(match.projectId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load project";
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
          showToastRef.current("Project connected!", "success");
        }
      } catch {
      }
    }, 3e3);
    return () => clearInterval(interval);
  }, [waitingForInstall, repoFullName, tryLoadSettings]);
  const handleInvite = useCallback(async () => {
    if (!projectId || !inviteEmail) return;
    setInviting(true);
    try {
      await inviteClient(shellRef.current, projectId, inviteEmail, "owner");
      showToastRef.current(`Invited ${inviteEmail} as owner`, "success");
      setInviteEmail("");
      await tryLoadSettings(projectId);
    } catch (err) {
      showToastRef.current(
        err instanceof Error ? err.message : "Failed to invite",
        "error"
      );
    } finally {
      setInviting(false);
    }
  }, [projectId, inviteEmail, tryLoadSettings]);
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "ce-body", children: /* @__PURE__ */ jsx("div", { style: { textAlign: "center", color: theme.textMuted, padding: 20 }, children: "Loading project..." }) });
  }
  if (error) {
    return /* @__PURE__ */ jsx("div", { className: "ce-body", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx(
        "div",
        {
          className: "ce-error",
          style: { background: `${theme.error}15`, color: theme.error },
          children: error
        }
      ),
      /* @__PURE__ */ jsx(
        "button",
        {
          className: "ce-btn",
          onClick: loadProject,
          style: { background: theme.bgTertiary, color: theme.textPrimary, marginTop: 12 },
          children: "Retry"
        }
      )
    ] }) });
  }
  if (needsGitHubInstall) {
    return /* @__PURE__ */ jsx("div", { className: "ce-body", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: theme.textMuted, marginBottom: 16 }, children: [
        "Repository: ",
        /* @__PURE__ */ jsx("span", { style: { color: theme.accent }, children: repoFullName })
      ] }),
      !waitingForInstall ? /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: theme.textSecondary, marginBottom: 12 }, children: "This repository isn't connected to Ship Studio yet. Install the GitHub App to connect it." }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "ce-btn",
            onClick: handleConnectGitHub,
            style: { background: theme.action, color: theme.actionText, width: "100%" },
            children: "Install GitHub App"
          }
        )
      ] }) : /* @__PURE__ */ jsxs(Fragment, { children: [
        /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: theme.textSecondary, marginBottom: 12 }, children: "Waiting for GitHub App installation..." }),
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", gap: 8 }, children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "ce-btn",
              onClick: handleConnectGitHub,
              style: { background: theme.bgTertiary, color: theme.textPrimary, flex: 1 },
              children: "Open GitHub Again"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              className: "ce-btn",
              onClick: async () => {
                if (!repoFullName) return;
                try {
                  const result = await pollForProject(shell, repoFullName, storage);
                  if (result) {
                    setProjectId(result.projectId);
                    setNeedsGitHubInstall(false);
                    setWaitingForInstall(false);
                    await tryLoadSettings(result.projectId);
                    showToast("Project connected!", "success");
                  } else {
                    showToast("Not found yet — keep waiting", "error");
                  }
                } catch {
                  showToast("Check failed — will keep polling", "error");
                }
              },
              style: { background: theme.bgTertiary, color: theme.textPrimary, flex: 1 },
              children: "Check Now"
            }
          )
        ] })
      ] })
    ] }) });
  }
  if (owner) {
    return /* @__PURE__ */ jsx("div", { className: "ce-body", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "ce-section", children: /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: theme.textMuted }, children: [
        "Project: ",
        /* @__PURE__ */ jsx("span", { style: { color: theme.accent }, children: repoFullName })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "ce-section", children: [
        /* @__PURE__ */ jsx("div", { className: "ce-section-title", style: { color: theme.textMuted }, children: "Client (Owner)" }),
        /* @__PURE__ */ jsxs("div", { className: "ce-row", style: { background: theme.bgTertiary }, children: [
          /* @__PURE__ */ jsx("span", { style: { color: theme.textPrimary }, children: owner.email }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "ce-badge",
              style: { background: `${theme.success}20`, color: theme.success },
              children: "Active"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: theme.textMuted, marginTop: 4 }, children: "If your client has lost access, please contact Ship Studio support." })
    ] }) });
  }
  if (pendingInvite) {
    return /* @__PURE__ */ jsx("div", { className: "ce-body", children: /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "ce-section", children: /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: theme.textMuted }, children: [
        "Project: ",
        /* @__PURE__ */ jsx("span", { style: { color: theme.accent }, children: repoFullName })
      ] }) }),
      /* @__PURE__ */ jsxs("div", { className: "ce-section", children: [
        /* @__PURE__ */ jsx("div", { className: "ce-section-title", style: { color: theme.textMuted }, children: "Pending Owner Invite" }),
        /* @__PURE__ */ jsxs("div", { className: "ce-row", style: { background: theme.bgTertiary }, children: [
          /* @__PURE__ */ jsx("span", { style: { color: theme.textPrimary }, children: pendingInvite.email }),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "ce-badge",
              style: { background: `${theme.accent}20`, color: theme.accent },
              children: "Pending"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { style: { fontSize: 11, color: theme.textMuted, marginTop: 8 }, children: "Waiting for them to accept the invite and set up billing." })
      ] })
    ] }) });
  }
  return /* @__PURE__ */ jsx("div", { className: "ce-body", children: /* @__PURE__ */ jsxs("div", { children: [
    /* @__PURE__ */ jsx("div", { className: "ce-section", children: /* @__PURE__ */ jsxs("div", { style: { fontSize: 12, color: theme.textMuted }, children: [
      "Project: ",
      /* @__PURE__ */ jsx("span", { style: { color: theme.accent }, children: repoFullName })
    ] }) }),
    /* @__PURE__ */ jsxs("div", { className: "ce-section", children: [
      /* @__PURE__ */ jsx("div", { className: "ce-section-title", style: { color: theme.textMuted }, children: "Invite Client as Owner" }),
      /* @__PURE__ */ jsx("div", { style: { fontSize: 12, color: theme.textMuted, marginBottom: 10 }, children: "The client will become the billing owner for this project." }),
      /* @__PURE__ */ jsxs("div", { className: "ce-form-row", children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            className: "ce-input",
            type: "email",
            placeholder: "client@example.com",
            value: inviteEmail,
            onChange: (e) => setInviteEmail(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") handleInvite();
            },
            style: { flex: 1 }
          }
        ),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "ce-btn",
            onClick: handleInvite,
            disabled: inviting || !inviteEmail,
            style: { background: theme.action, color: theme.actionText, whiteSpace: "nowrap" },
            children: inviting ? "..." : "Invite"
          }
        )
      ] })
    ] })
  ] }) });
}
function SettingsView({ shell, theme, userEmail, onSignOut }) {
  const handleSignOut = useCallback(async () => {
    await deleteAuthFile(shell);
    onSignOut();
  }, [shell, onSignOut]);
  return /* @__PURE__ */ jsxs("div", { className: "ce-body", children: [
    /* @__PURE__ */ jsxs("div", { className: "ce-section", children: [
      /* @__PURE__ */ jsx("div", { className: "ce-section-title", style: { color: theme.textMuted }, children: "Account" }),
      /* @__PURE__ */ jsxs("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "center" }, children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: theme.textSecondary }, children: userEmail }),
        /* @__PURE__ */ jsx(
          "button",
          {
            className: "ce-btn",
            onClick: handleSignOut,
            style: { background: `${theme.error}15`, color: theme.error },
            children: "Sign Out"
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "ce-divider" }),
    /* @__PURE__ */ jsx(
      "div",
      {
        className: "ce-empty",
        style: { background: theme.bgTertiary, color: theme.textMuted },
        children: "More settings coming soon."
      }
    )
  ] });
}
function Modal({ onClose }) {
  const ctx = usePluginContext();
  if (!ctx) return /* @__PURE__ */ jsx("span", {});
  const { shell, theme, storage, actions } = ctx;
  const [view, setView] = useState("auth");
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    readAuthFile(shell).then((a) => {
      if (a) {
        setAuth(a);
        setView("main");
      }
      setLoading(false);
    });
  }, [shell]);
  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);
  const handleAuthSuccess = useCallback(async () => {
    const a = await readAuthFile(shell);
    if (a) {
      setAuth(a);
      setView("main");
    }
  }, [shell]);
  const handleSignOut = useCallback(() => {
    setAuth(null);
    setView("auth");
  }, []);
  return /* @__PURE__ */ jsx("div", { className: "ce-overlay", onClick: onClose, children: /* @__PURE__ */ jsxs(
    "div",
    {
      className: "ce-modal",
      style: {
        background: theme.bgPrimary,
        color: theme.textPrimary,
        border: `1px solid ${theme.border}`
      },
      onClick: (e) => e.stopPropagation(),
      children: [
        /* @__PURE__ */ jsxs(
          "div",
          {
            className: "ce-header",
            style: { borderBottom: `1px solid ${theme.border}` },
            children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
                /* @__PURE__ */ jsx("span", { children: "Client Editor" }),
                auth && /* @__PURE__ */ jsxs("div", { className: "ce-tabs", children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "ce-tab",
                      onClick: () => setView("main"),
                      style: {
                        color: view === "main" ? theme.textPrimary : theme.textMuted,
                        background: view === "main" ? theme.bgTertiary : "transparent"
                      },
                      children: "Clients"
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      className: "ce-tab",
                      onClick: () => setView("settings"),
                      style: {
                        color: view === "settings" ? theme.textPrimary : theme.textMuted,
                        background: view === "settings" ? theme.bgTertiary : "transparent"
                      },
                      children: "Settings"
                    }
                  )
                ] })
              ] }),
              /* @__PURE__ */ jsx(
                "button",
                {
                  className: "ce-btn",
                  onClick: onClose,
                  style: { background: theme.bgTertiary, color: theme.textSecondary },
                  children: "Close"
                }
              )
            ]
          }
        ),
        loading ? /* @__PURE__ */ jsx(
          "div",
          {
            className: "ce-body",
            style: { textAlign: "center", color: theme.textMuted, padding: 40 },
            children: "Loading..."
          }
        ) : view === "auth" ? /* @__PURE__ */ jsx(AuthView, { shell, theme, onAuthSuccess: handleAuthSuccess }) : view === "settings" ? /* @__PURE__ */ jsx(
          SettingsView,
          {
            shell,
            theme,
            userEmail: (auth == null ? void 0 : auth.user_email) || "",
            onSignOut: handleSignOut
          }
        ) : /* @__PURE__ */ jsx(
          MainView,
          {
            shell,
            theme,
            storage,
            showToast: actions.showToast,
            openUrl: actions.openUrl
          }
        )
      ]
    }
  ) });
}
function ToolbarButton() {
  const [modalOpen, setModalOpen] = useState(false);
  const ctx = usePluginContext();
  useInjectStyles();
  if (!ctx) return /* @__PURE__ */ jsx("span", {});
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx(
      "button",
      {
        onClick: () => setModalOpen(true),
        title: "Client Editor",
        className: "toolbar-icon-btn",
        children: /* @__PURE__ */ jsxs(
          "svg",
          {
            width: "14",
            height: "14",
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            strokeWidth: "2",
            strokeLinecap: "round",
            strokeLinejoin: "round",
            children: [
              /* @__PURE__ */ jsx("path", { d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" }),
              /* @__PURE__ */ jsx("circle", { cx: "9", cy: "7", r: "4" }),
              /* @__PURE__ */ jsx("path", { d: "M23 21v-2a4 4 0 0 0-3-3.87" }),
              /* @__PURE__ */ jsx("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" })
            ]
          }
        )
      }
    ),
    modalOpen && /* @__PURE__ */ jsx(Modal, { onClose: () => setModalOpen(false) })
  ] });
}
const name = "Client Editor";
const slots = {
  toolbar: ToolbarButton
};
function onActivate() {
  console.log("[client-editor] Plugin activated");
}
function onDeactivate() {
  console.log("[client-editor] Plugin deactivated");
}
export {
  name,
  onActivate,
  onDeactivate,
  slots
};
