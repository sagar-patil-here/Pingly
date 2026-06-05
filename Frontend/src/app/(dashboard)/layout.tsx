import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { PwaInstallButton } from "@/components/pwa-install-button"; // 1. Imported the PWA installer component

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header line container bar items justified horizontally to position the button on the far right */}
        <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-background/50 backdrop-blur-xl shrink-0">
          <div className="flex items-center">
            <SidebarTrigger />
          </div>
          
          <div className="flex items-center gap-4">
            {/* 2. Seamlessly injects the standard PWA text action button inside user account views */}
            <PwaInstallButton variant="default" />
          </div>
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