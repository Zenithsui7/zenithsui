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

// ── Environment detection ──────────────────────────────────────────────────
const isGitHubPages = typeof window !== "undefined" &&
  (window.location.hostname.endsWith("github.io") ||
   window.location.hostname.endsWith("js.org"));

// ── GitHub file store constants ────────────────────────────────────────────
const GH_OWNER  = "Zenithsui7";
const GH_REPO   = "Zenithsui7.github.io";
const GH_BRANCH = "gh-pages";
const GH_FILE   = "data.json";
const GH_RAW    = `https://raw.githubusercontent.com/${GH_OWNER}/${GH_REPO}/${GH_BRANCH}/${GH_FILE}`;
const GH_API    = `https://api.github.com/repos/${GH_OWNER}/${GH_REPO}/contents/${GH_FILE}`;
const GH_TOKEN  = import.meta.env.VITE_GH_TOKEN as string | undefined;

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

function notify() { listeners.forEach((l) => l()); }

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  if (_initialized) return;
  _initialized = true;
  try {
    if (isGitHubPages) {
      const res = await fetch(`${GH_RAW}?t=${Date.now()}`);
      _apps = res.ok ? (await res.json()).apps ?? DEFAULT_APPS : DEFAULT_APPS;
    } else {
      const res = await fetch("/api/apps");
      if (res.ok) _apps = await res.json();
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

export function getApps(): App[] { return _apps; }

// ── GitHub file write ──────────────────────────────────────────────────────
async function pushToGitHub(apps: App[]) {
  const token = GH_TOKEN;
  if (!token) throw new Error("NO_TOKEN");
  const headers: Record<string, string> = {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
  };
  const metaRes = await fetch(`${GH_API}?ref=${GH_BRANCH}`, { headers });
  const meta = await metaRes.json();
  const body = JSON.stringify({
    message: "update: apps data",
    content: btoa(unescape(encodeURIComponent(JSON.stringify({ apps }, null, 2)))),
    branch: GH_BRANCH,
    ...(meta.sha ? { sha: meta.sha } : {}),
  });
  const put = await fetch(GH_API, { method: "PUT", headers, body });
  if (!put.ok) {
    const e = await put.json();
    const msg: string = e.message || "GitHub write failed";
    if (msg.toLowerCase().includes("bad credential") || msg.toLowerCase().includes("unauthorized"))
      throw new Error("BAD_TOKEN");
    throw new Error(msg);
  }
}

// ── API write (Replit) ─────────────────────────────────────────────────────
async function apiCreate(data: Pick<App, "name" | "url" | "icon" | "color">): Promise<App> {
  const res = await fetch("/api/apps", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

async function apiDelete(id: number) {
  const res = await fetch(`/api/apps/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(await res.text());
}

async function apiLaunch(id: number): Promise<App> {
  const res = await fetch(`/api/apps/${id}/launch`, { method: "POST" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ── Public store actions ───────────────────────────────────────────────────
export async function createApp(
  data: Pick<App, "name" | "url" | "icon" | "color">
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (isGitHubPages) {
      const app: App = { ...data, id: Date.now(), launchCount: 0, lastLaunchedAt: null, position: _apps.length };
      _apps = [..._apps, app];
      notify();
      try { await pushToGitHub(_apps); return { ok: true }; }
      catch (e) { _apps = _apps.filter((a) => a.id !== app.id); notify(); throw e; }
    } else {
      const app = await apiCreate(data);
      _apps = [..._apps, app];
      notify();
      return { ok: true };
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to save";
    return { ok: false, error: msg === "BAD_TOKEN" ? "GitHub sync token is invalid. Contact the site owner." : msg };
  }
}

export async function deleteApp(id: number): Promise<{ ok: boolean; error?: string }> {
  try {
    if (isGitHubPages) {
      const prev = _apps;
      _apps = _apps.filter((a) => a.id !== id);
      notify();
      try { await pushToGitHub(_apps); return { ok: true }; }
      catch (e) { _apps = prev; notify(); throw e; }
    } else {
      await apiDelete(id);
      _apps = _apps.filter((a) => a.id !== id);
      notify();
      return { ok: true };
    }
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to delete";
    return { ok: false, error: msg === "BAD_TOKEN" ? "GitHub sync token is invalid. Contact the site owner." : msg };
  }
}

export async function launchApp(id: number) {
  try {
    if (isGitHubPages) {
      _apps = _apps.map((a) =>
        a.id === id ? { ...a, launchCount: a.launchCount + 1, lastLaunchedAt: new Date().toISOString() } : a
      );
      notify();
      pushToGitHub(_apps).catch(() => {});
    } else {
      const updated = await apiLaunch(id);
      _apps = _apps.map((a) => (a.id === id ? { ...a, ...updated } : a));
      notify();
    }
  } catch { /* non-critical */ }
}

export function getStats() {
  return { totalApps: _apps.length, totalLaunches: _apps.reduce((s, a) => s + a.launchCount, 0) };
}

export function getRecent(limit = 5): App[] {
  return _apps
    .filter((a) => a.lastLaunchedAt)
    .sort((a, b) => (b.lastLaunchedAt! > a.lastLaunchedAt! ? 1 : -1))
    .slice(0, limit);
}
