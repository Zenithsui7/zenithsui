import { ReactNode, useState } from "react";
import { Lock, LockOpen, Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { useOwner } from "@/contexts/OwnerContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ShellProps {
  children: ReactNode;
}

export default function Shell({ children }: ShellProps) {
  const { isOwner, unlock, lock } = useOwner();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");

  const handleUnlock = () => {
    const ok = unlock(password);
    if (ok) {
      setPassword("");
      setError("");
      setDialogOpen(false);
    } else {
      setError("Incorrect password");
    }
  };

  const handleLockToggle = () => {
    if (isOwner) {
      lock();
    } else {
      setPassword("");
      setError("");
      setDialogOpen(true);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden">

      {/* ── Animated background ── */}
      <div className="bg-scene">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="bg-grid" />
        <div className="bg-noise" />
      </div>

      {/* ── Floating top bar ── */}
      <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden ring-1 ring-primary/40 shadow-lg shadow-primary/20 flex-shrink-0">
            <img
              src="logo.png"
              alt="ZenithSui"
              className="w-full h-full object-cover"
              onError={(e) => {
                const el = e.currentTarget as HTMLImageElement;
                el.style.display = "none";
                const parent = el.parentElement!;
                parent.style.background = "linear-gradient(135deg,#f97316,#ea580c)";
                parent.textContent = "Z";
                parent.style.display = "flex";
                parent.style.alignItems = "center";
                parent.style.justifyContent = "center";
                parent.style.color = "white";
                parent.style.fontWeight = "bold";
                parent.style.fontSize = "16px";
              }}
            />
          </div>
          <span className="font-bold text-lg tracking-tight text-white drop-shadow">ZenithSui</span>
        </div>

        {/* Owner toggle */}
        <button
          onClick={handleLockToggle}
          title={isOwner ? "Exit owner mode" : "Owner login"}
          className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium backdrop-blur-md transition-all border",
            isOwner
              ? "text-primary bg-primary/15 border-primary/30 hover:bg-primary/25 shadow-lg shadow-primary/10"
              : "text-white/60 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white"
          )}
        >
          {isOwner ? <LockOpen className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {isOwner ? "Owner mode" : "Owner login"}
        </button>
      </div>

      {/* ── Top bar blur strip ── */}
      <div
        className="absolute top-0 left-0 right-0 z-10 h-20 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, rgba(8,8,15,0.7) 0%, transparent 100%)",
          backdropFilter: "blur(0px)",
        }}
      />

      {/* ── Main content ── */}
      <main className="relative z-10 w-full h-full overflow-y-auto pt-20">
        {children}
      </main>

      {/* ── Owner password dialog ── */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(o) => { setDialogOpen(o); setError(""); setPassword(""); }}
      >
        <DialogContent className="sm:max-w-xs border-white/10"
          style={{ background: "rgba(10,10,20,0.92)", backdropFilter: "blur(32px)" }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Owner Access
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                placeholder="Enter owner password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                onKeyDown={(e) => e.key === "Enter" && handleUnlock()}
                className={cn("pr-10 bg-white/5 border-white/10", error && "border-destructive")}
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPw((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button size="sm" onClick={handleUnlock} className="shadow-lg shadow-primary/20">
                Unlock
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
