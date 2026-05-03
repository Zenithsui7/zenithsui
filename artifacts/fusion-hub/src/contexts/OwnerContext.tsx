import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const STORAGE_KEY = "zenithsui_owner";
const OWNER_PASSWORD = import.meta.env.VITE_OWNER_PASSWORD ?? "zenithsui";

interface OwnerContextValue {
  isOwner: boolean;
  unlock: (password: string) => boolean;
  lock: () => void;
}

const OwnerContext = createContext<OwnerContextValue>({
  isOwner: false,
  unlock: () => false,
  lock: () => {},
});

export function OwnerProvider({ children }: { children: ReactNode }) {
  const [isOwner, setIsOwner] = useState(() => {
    try { return sessionStorage.getItem(STORAGE_KEY) === "1"; } catch { return false; }
  });

  const unlock = (password: string) => {
    if (password === OWNER_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setIsOwner(true);
      return true;
    }
    return false;
  };

  const lock = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setIsOwner(false);
  };

  return (
    <OwnerContext.Provider value={{ isOwner, unlock, lock }}>
      {children}
    </OwnerContext.Provider>
  );
}

export function useOwner() {
  return useContext(OwnerContext);
}
