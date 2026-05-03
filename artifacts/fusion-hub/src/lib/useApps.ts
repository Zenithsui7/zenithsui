import { useSyncExternalStore, useCallback } from "react";
import {
  subscribe,
  getApps,
  createApp,
  deleteApp,
  launchApp,
  getStats,
  getRecent,
  getToken,
  setToken,
  type App,
} from "./store";

export type { App };

export function useApps(search?: string) {
  const apps = useSyncExternalStore(subscribe, getApps);
  const filtered = search
    ? apps.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : apps;
  return filtered;
}

export function useRecentApps(limit = 5) {
  const _ = useSyncExternalStore(subscribe, getApps);
  return getRecent(limit);
}

export function useAppStats() {
  const _ = useSyncExternalStore(subscribe, getApps);
  return getStats();
}

export function useCreateApp() {
  return useCallback(
    (data: Pick<App, "name" | "url" | "icon" | "color">) => createApp(data),
    []
  );
}

export function useDeleteApp() {
  return useCallback((id: number) => deleteApp(id), []);
}

export function useLaunchApp() {
  return useCallback((id: number) => launchApp(id), []);
}

export { getToken, setToken };
