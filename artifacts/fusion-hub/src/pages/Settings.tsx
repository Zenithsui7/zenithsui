import { useGetCurrentAuthUser } from "@workspace/api-client-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings as SettingsIcon, User, LogOut, Shield } from "lucide-react";

export default function Settings() {
  const { data: authEnv } = useGetCurrentAuthUser();
  const user = authEnv?.user;

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
        </div>

        {/* Profile */}
        <div className="glass-panel rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Profile</h2>
          </div>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 border border-white/10">
              <AvatarImage src={user?.profileImageUrl || ""} />
              <AvatarFallback className="text-xl bg-primary/20 text-primary">
                {user?.firstName?.[0] || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-lg">{[user?.firstName, user?.lastName].filter(Boolean).join(" ") || "User"}</p>
              <p className="text-muted-foreground text-sm">{user?.email || "No email"}</p>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="glass-panel rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">Security</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            Your account is secured via Replit authentication. No password required.
          </p>
          <a href="/api/logout">
            <Button variant="destructive" className="gap-2" data-testid="btn-logout">
              <LogOut className="w-4 h-4" />
              Sign Out
            </Button>
          </a>
        </div>

        {/* About */}
        <div className="glass-panel rounded-xl p-6">
          <div className="flex items-center gap-2 mb-2">
            <SettingsIcon className="w-4 h-4 text-primary" />
            <h2 className="font-semibold">About FusionHub</h2>
          </div>
          <p className="text-sm text-muted-foreground">
            FusionHub is your personal command center for the web. Add any website or tool and access it all in one place.
          </p>
          <p className="text-xs text-muted-foreground/60 mt-3">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}
