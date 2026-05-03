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

const isGitHubPages = typeof window !== "undefined" &&
  (window.location.hostname.endsWith("github.io") ||
   window.location.hostname.endsWith("js.org"));

const LS_KEY = "zenithsui_apps";

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

// ── localStorage helpers (GitHub Pages) ────────────────────────────────────
function lsLoad(): App[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) return JSON.parse(raw) as App[];
  } catch { /* ignore */ }
  return DEFAULT_APPS;
}

function lsSave(apps: App[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(apps));
}

// ── Init ───────────────────────────────────────────────────────────────────
async function init() {
  if (_initialized) return;
  _initialized = true;
  if (isGitHubPages) {
    _apps = lsLoad();
    notify();
  } else {
    try {
      const res = await fetch("/api/apps");
      if (res.ok) _apps = await res.json();
    } catch { _apps = DEFAULT_APPS; }
    notify();
  }
}

init();

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getApps(): App[] { return _apps; }

// ── API helpers (Replit) ───────────────────────────────────────────────────
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

// ── Public actions ─────────────────────────────────────────────────────────
export async function createApp(
  data: Pick<App, "name" | "url" | "icon" | "color">
): Promise<{ ok: boolean; error?: string }> {
  try {
    if (isGitHubPages) {
      const app: App = { ...data, id: Date.now(), launchCount: 0, lastLaunchedAt: null, position: _apps.length };
      _apps = [..._apps, app];
      lsSave(_apps);
      notify();
    } else {
      const app = await apiCreate(data);
      _apps = [..._apps, app];
      notify();
    }
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to save" };
  }
}

export async function deleteApp(id: number): Promise<{ ok: boolean; error?: string }> {
  try {
    if (isGitHubPages) {
      _apps = _apps.filter((a) => a.id !== id);
      lsSave(_apps);
      notify();
    } else {
      await apiDelete(id);
      _apps = _apps.filter((a) => a.id !== id);
      notify();
    }
    return { ok: true };
  } catch (e: unknown) {
    return { ok: false, error: e instanceof Error ? e.message : "Failed to delete" };
  }
}

export async function launchApp(id: number) {
  try {
    if (isGitHubPages) {
      _apps = _apps.map((a) =>
        a.id === id ? { ...a, launchCount: a.launchCount + 1, lastLaunchedAt: new Date().toISOString() } : a
      );
      lsSave(_apps);
      notify();
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
