import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

import LandingPage from "./pages/LandingPage";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import EventGallery from "./pages/EventGallery";
import PublicGallery from "./pages/PublicGallery";
import NotFound from "./pages/NotFound";

const App = () => {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage session={session} />} />
          <Route path="/dashboard" element={<Dashboard session={session} />} />
          <Route path="/events" element={<Events session={session} />} />
          <Route path="/event/:id" element={<EventGallery session={session} />} />
          <Route path="/gallery/:slug" element={<PublicGallery />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  );
};

export default App;
