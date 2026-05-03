import { useState } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface App {
  id: number;
  name: string;
  url: string;
  icon: string;
  color: string;
}

interface AppCardProps {
  app: App;
  onOpen: () => void;
  onDelete: () => void;
  isOwner?: boolean;
}

export default function AppCard({ app, onOpen, onDelete, isOwner }: AppCardProps) {
  const [hovered, setHovered] = useState(false);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  const isEmoji = (str: string) => /\p{Emoji}/u.test(str) && str.length <= 4;

  return (
    <div
      className={cn(
        "glass-panel rounded-xl p-4 cursor-pointer group transition-all duration-200 relative overflow-hidden",
        "hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
      )}
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Accent glow */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(circle at 50% 0%, ${app.color}15 0%, transparent 60%)` }}
      />

      {/* Delete — owner only */}
      {isOwner && (
        <div className={cn(
          "absolute top-2 right-2 transition-all duration-200",
          hovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
        )}>
          <button
            onClick={handleDelete}
            className="w-7 h-7 rounded-md bg-background/80 backdrop-blur flex items-center justify-center hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
          </button>
        </div>
      )}

      {/* Icon + Name */}
      <div className="flex flex-col items-center text-center gap-3 pt-2">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-lg flex-shrink-0 transition-transform duration-200 group-hover:scale-110"
          style={{ background: `${app.color}20`, border: `1px solid ${app.color}30` }}
        >
          {isEmoji(app.icon) ? (
            <span>{app.icon}</span>
          ) : (
            <img
              src={app.icon}
              alt=""
              className="w-8 h-8 object-contain rounded"
              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          )}
        </div>
        <p className="text-sm font-medium truncate w-full">{app.name}</p>
      </div>
    </div>
  );
}
