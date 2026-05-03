import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import AppCard from "@/components/AppCard";
import AddAppDialog from "@/components/AddAppDialog";
import { useOwner } from "@/contexts/OwnerContext";
import { useApps, useDeleteApp, useLaunchApp } from "@/lib/useApps";
import { useToast } from "@/hooks/use-toast";

export default function AppsList() {
  const [search, setSearch] = useState("");
  const { isOwner } = useOwner();
  const apps = useApps(search);
  const deleteApp = useDeleteApp();
  const launchApp = useLaunchApp();
  const { toast } = useToast();

  const handleOpen = (app: { id: number; url: string }) => {
    launchApp(app.id);
    window.open(app.url, "_blank", "noopener,noreferrer");
  };

  const handleDelete = async (id: number) => {
    const result = await deleteApp(id);
    if (!result.ok) {
      toast({ title: "Could not delete", description: result.error, variant: "destructive" });
    }
  };

  return (
    <div className="w-full min-h-full px-6 md:px-10 lg:px-16 pb-10 space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 bg-white/5 border-white/10 backdrop-blur-md"
          />
        </div>
        {isOwner && <AddAppDialog />}
      </div>

      {apps.length === 0 ? (
        <div className="glass-panel rounded-2xl p-16 text-center max-w-md mx-auto mt-20">
          <div className="text-5xl mb-4">🚀</div>
          <h3 className="font-semibold text-lg mb-2">
            {search ? "No apps match your search" : "No apps yet"}
          </h3>
          <p className="text-muted-foreground text-sm mb-6">
            {search
              ? "Try a different search term"
              : isOwner
              ? "Add your first app to get started"
              : "Ask the owner to add apps"}
          </p>
          {!search && isOwner && <AddAppDialog />}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {apps.map((app) => (
            <AppCard
              key={app.id}
              app={app}
              onOpen={() => handleOpen(app)}
              onDelete={() => handleDelete(app.id)}
              isOwner={isOwner}
            />
          ))}
        </div>
      )}
    </div>
  );
}
