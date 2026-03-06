import DashboardLayout from "@/components/DashboardLayout";

interface Props {
  session: any;
}

export default function Dashboard({ session }: Props) {
  return (
    <DashboardLayout>
      <div className="max-w-[480px] mx-auto">
        <h1 className="text-3xl font-serif mb-6">Dashboard</h1>
        {session ? (
          <div className="space-y-4">
            <div className="bg-card border border-border/50 rounded-lg p-6">
              <h2 className="text-xl font-serif mb-2">Welcome back</h2>
              <p className="text-sm text-muted-foreground">Manage your galleries and events from here.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Please sign in to access your dashboard.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
