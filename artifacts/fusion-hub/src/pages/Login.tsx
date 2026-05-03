import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Hexagon } from "lucide-react";

export default function Login() {
  const handleLogin = () => {
    window.location.href = `/api/login?returnTo=/`;
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      <Card className="w-full max-w-md glass-panel border-white/10 z-10 mx-4">
        <CardContent className="p-8 md:p-12 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center shadow-lg shadow-primary/20 mb-8 ring-1 ring-white/20">
            <Hexagon className="w-8 h-8 text-white fill-white/20" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-3">
            FusionHub
          </h1>
          <p className="text-muted-foreground text-lg mb-10 max-w-[280px]">
            Your personal command center for the web.
          </p>

          <Button 
            size="lg" 
            className="w-full text-md h-14 font-medium transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-primary/20"
            onClick={handleLogin}
          >
            Sign in with Replit
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          
          <p className="mt-8 text-xs text-muted-foreground/60">
            Secure, passwordless authentication.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
