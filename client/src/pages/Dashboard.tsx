import type { Session } from "@supabase/supabase-js";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";

interface Props {
  session: Session | null;
}

export default function Dashboard({ session }: Props) {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) navigate("/");
  }, [session, navigate]);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-muted-foreground">Welcome to MirrorAI. Select an option from the sidebar to get started.</p>
    </DashboardLayout>
  );
}
