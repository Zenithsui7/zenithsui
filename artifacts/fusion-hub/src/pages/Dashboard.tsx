import { useApps, useRecentApps, useAppStats, useDeleteApp, useLaunchApp } from "@/lib/useApps";
import { Plus, Clock, BarChart3, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import AppCard from "@/components/AppCard";
import AddAppDialog from "@/components/AddAppDialog";
import { useOwner } from "@/contexts/OwnerContext";

export default function Dashboard() {
  const { isOwner } = useOwner();
  const apps = useApps();
  const recent = useRecentApps(5);
  const stats = useAppStats();
  const deleteApp = useDeleteApp();
  const launchApp = useLaunchApp();

  const handleOpen = (app: { id: number; url: string }) => {
    launchApp(app.id);
    window.open(app.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">Your personal web command center</p>
          </div>
          {isOwner && <AddAppDialog />}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[
            { label: "Total Apps", value: stats.totalApps, icon: Layers, color: "text-primary" },
            { label: "Total Launches", value: stats.totalLaunches, icon: BarChart3, color: "text-blue-400" },
            { label: "Recent", value: recent.length, icon: Clock, color: "text-purple-400" },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel rounded-xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {recent.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-blue-400" />
              <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Recent</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recent.map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onOpen={() => handleOpen(app)}
                  onDelete={() => deleteApp(app.id)}
                  isOwner={isOwner}
                />
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">All Apps</h2>
          {apps.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {apps.slice(0, 10).map((app) => (
                <AppCard
                  key={app.id}
                  app={app}
                  onOpen={() => handleOpen(app)}
                  onDelete={() => deleteApp(app.id)}
                  isOwner={isOwner}
                />
              ))}
            </div>
          ) : (
            <div className="glass-panel rounded-xl p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No apps yet</h3>
              <p className="text-muted-foreground text-sm mb-6">
                {isOwner ? "Add your first app to get started" : "Ask the owner to add apps"}
              </p>
              {isOwner && <AddAppDialog />}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
