import { Outlet } from "react-router-dom";
import { AppSidebar } from "../app-sidebar";
import { MediaPlayer } from "../media-player";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUIStore } from "@/lib/store";

export function MainLayout() {
  const { sidebarOpen } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground relative z-0">

      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-background">
        <div className="absolute -top-[20%] -left-[10%] w-[70vw] h-[70vw] rounded-full bg-primary/10 blur-[120px] animate-wander" />
        <div className="absolute top-[20%] -right-[10%] w-[60vw] h-[60vw] rounded-full bg-[#ff9500]/10 blur-[120px] animate-wander animation-delay-2000" />
        <div className="absolute -bottom-[20%] left-[20%] w-[80vw] h-[80vw] rounded-full bg-[#af52de]/10 blur-[120px] animate-wander animation-delay-4000" />

        <div className="absolute inset-0 bg-background/80 backdrop-blur-[100px]" />
      </div>

      <AppSidebar />
      <main className={`flex-1 flex flex-col pb-[90px] min-w-0 overflow-hidden bg-transparent z-10 ${sidebarOpen ? 'md:pl-[280px]' : 'md:pl-[72px]'}`}>
        <ScrollArea className="h-full w-full">
          <div className="px-6 py-4">
            <Outlet />
          </div>
        </ScrollArea>
      </main>
      <div className="z-50 relative">
        <MediaPlayer />
      </div>
    </div>
  );
}
