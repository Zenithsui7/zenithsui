export interface App {
  id: number;
  name: string;
  url: string;
  icon: string;
  color: string;
  launchCount: number;
  lastLaunchedAt: string | null;
  position: number;
}

const OWNER    = "Zenithsui7";
const REPO     = "Zenithsui7.github.io";
const BRANCH   = "gh-pages";
const FILE     = "data.json";
const RAW_URL  = `https://raw.githubusercontent.com/${OWNER}/${REPO}/${BRANCH}/${FILE}`;
const API_URL  = `https://api.github.com/repos/${OWNER}/${REPO}/contents/${FILE}`;
const TOKEN_KEY = "gh_sync_token";

export const DEFAULT_APPS: App[] = [
  { id: 1, name: "YouTube",  url: "https://youtube.com",          icon: "▶️",  color: "#ef4444", launchCount: 0, lastLaunchedAt: null, position: 0 },
  { id: 2, name: "GitHub",   url: "https://github.com",            icon: "🐙",  color: "#8b5cf6", launchCount: 0, lastLaunchedAt: null, position: 1 },
  { id: 3, name: "ChatGPT",  url: "https://chat.openai.com",       icon: "🤖",  color: "#10b981", launchCount: 0, lastLaunchedAt: null, position: 2 },
  { id: 4, name: "Google",   url: "https://google.com",            icon: "🔍",  color: "#3b82f6", launchCount: 0, lastLaunchedAt: null, position: 3 },
  { id: 5, name: "Twitter",  url: "https://x.com",                 icon: "🐦",  color: "#06b6d4", launchCount: 0, lastLaunchedAt: null, position: 4 },
  { id: 6, name: "Gmail",    url: "https://mail.google.com",       icon: "📧",  color: "#f97316", launchCount: 0, lastLaunchedAt: null, position: 5 },
  { id: 7, name: "Spotify",  url: "https://open.spotify.com",      icon: "🎵",  color: "#10b981", launchCount: 0, lastLaunchedAt: null, position: 6 },
  { id: 8, name: "Reddit",   url: "https://reddit.com",            icon: "🔥",  color: "#f97316", launchCount: 0, lastLaunchedAt: null, position: 7 },
];

const listeners = new Set<() => void>();
let _apps: App[] = [];
let _initialized = false;

function notify() {
  listeners.forEach((l) => l());
}

export function getToken(): string {
  return localStorage.getItem(TOKEN_KEY) || "";
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token.trim());
}

async function init() {
  if (_initialized) return;
  _initialized = true;
  try {
    const res = await fetch(`${RAW_URL}?t=${Date.now()}`);
    if (res.ok) {
      const data = await res.json();
      _apps = Array.isArray(data.apps) ? data.apps : DEFAULT_APPS;
    } else {
      _apps = DEFAULT_APPS;
    }
  } catch {
    _apps = DEFAULT_APPS;
  }
  notify();
}

init();

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getApps(): App[] {
  return _apps;
}

async function pushToGitHub(apps: App[]) {
  const token = getToken();
  if (!token) throw new Error("NO_TOKEN");

  const headers: Record<string, string> = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };

  // Get current file SHA
  const metaRes = await fetch(`${API_URL}?ref=${BRANCH}`, { headers });
  const meta = await metaRes.json();
  const sha = meta.sha as string | undefined;

  const body = JSON.stringify(
    {
      message: "update: apps data",
      content: btoa(unescape(encodeURIComponent(JSON.stringify({ apps }, null, 2)))),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    },
    null,
    2
  );

  const putRes = await fetch(API_URL, { method: "PUT", headers, body });
  if (!putRes.ok) {
    const err = await putRes.json();
    throw new Error(err.message || "GitHub write failed");
  }
}

export async function createApp(data: Pick<App, "name" | "url" | "icon" | "color">): Promise<{ ok: boolean; error?: string }> {
  const token = getToken();
  if (!token) return { ok: false, error: "Enter your GitHub token in Owner login first." };

  const app: App = {
    ...data,
    id: Date.now(),
    launchCount: 0,
    lastLaunchedAt: null,
    position: _apps.length,
  };
  _apps = [..._apps, app];
  notify();
  try {
    await pushToGitHub(_apps);
    return { ok: true };
  } catch (e: unknown) {
    // Roll back optimistic update on failure
    _apps = _apps.filter((a) => a.id !== app.id);
    notify();
    return { ok: false, error: e instanceof Error ? e.message : "GitHub write failed" };
  }
}

export async function deleteApp(id: number): Promise<{ ok: boolean; error?: string }> {
  const token = getToken();
  if (!token) return { ok: false, error: "Enter your GitHub token in Owner login first." };

  const prev = _apps;
  _apps = _apps.filter((a) => a.id !== id);
  notify();
  try {
    await pushToGitHub(_apps);
    return { ok: true };
  } catch (e: unknown) {
    _apps = prev;
    notify();
    return { ok: false, error: e instanceof Error ? e.message : "GitHub write failed" };
  }
}

export async function launchApp(id: number) {
  _apps = _apps.map((a) =>
    a.id === id
      ? { ...a, launchCount: a.launchCount + 1, lastLaunchedAt: new Date().toISOString() }
      : a
  );
  notify();
  // fire-and-forget launch count (non-critical)
  pushToGitHub(_apps).catch(() => {});
}

export function getStats() {
  return {
    totalApps: _apps.length,
    totalLaunches: _apps.reduce((s, a) => s + a.launchCount, 0),
  };
}

export function getRecent(limit = 5): App[] {
  return _apps
    .filter((a) => a.lastLaunchedAt)
    .sort((a, b) => (b.lastLaunchedAt! > a.lastLaunchedAt! ? 1 : -1))
    .slice(0, limit);
}
