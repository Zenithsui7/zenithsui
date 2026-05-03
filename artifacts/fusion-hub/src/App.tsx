import { useEffect } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import AppsList from "@/pages/AppsList";
import Shell from "@/components/layout/Shell";
import { OwnerProvider } from "@/contexts/OwnerContext";

function Router() {
  return (
    <Shell>
      <Switch>
        <Route path="/" component={AppsList} />
        <Route path="/apps" component={AppsList} />
        <Route component={NotFound} />
      </Switch>
    </Shell>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <TooltipProvider>
      <OwnerProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </OwnerProvider>
    </TooltipProvider>
  );
}

export default App;
