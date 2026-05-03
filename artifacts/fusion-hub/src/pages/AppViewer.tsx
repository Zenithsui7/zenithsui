import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getApps } from "@/lib/store";

export default function AppViewer() {
  const params = useParams<{ id: string }>();
  const id = parseInt(params.id ?? "0", 10);
  const [, setLocation] = useLocation();

  const app = getApps().find((a) => a.id === id);

  if (!app) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">App not found</p>
          <Button onClick={() => setLocation("/apps")} variant="secondary">Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center glass-panel rounded-xl p-10 max-w-sm">
        <h3 className="font-semibold text-lg mb-2">{app.name}</h3>
        <a href={app.url} target="_blank" rel="noopener noreferrer">
          <Button className="gap-2 w-full shadow-lg shadow-primary/20">
            <ExternalLink className="w-4 h-4" />Open in new tab
          </Button>
        </a>
        <Button variant="ghost" size="sm" className="mt-3 gap-2" onClick={() => setLocation("/apps")}>
          <ArrowLeft className="w-4 h-4" />Back
        </Button>
      </div>
    </div>
  );
}
