import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 flex items-center px-6 border-b border-border/50 bg-background/50 backdrop-blur-xl shrink-0">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-y-auto bg-muted/20">
          <div className="mx-auto w-full max-w-6xl p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
