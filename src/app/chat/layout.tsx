import { AppSidebar } from "@/components/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {getAllChatsForSession} from "@/lib/rag/queries";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 items-center sticky top-0 z-50 bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger className="h-9 w-9" variant="secondary" />
          <div className="flex flex-1" />
          <ThemeSwitcher />
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
