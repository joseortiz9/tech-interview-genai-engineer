import {GalleryVerticalEndIcon} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {headers} from "next/headers";
import {AppSidebarMenuButton} from "./app-sidebar-menu-button";
import {createClient} from "@/lib/supabase/server";

const tempHistory = [
  {
    id: '1',
    title: 'History Item 1',
  },
  {
    id: '2',
    title: 'History Item 2',
  },
  {
    id: '3',
    title: 'History Item 3',
  }
]

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {};

export async function AppSidebar({ ...props }: AppSidebarProps) {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path");
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <GalleryVerticalEndIcon className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="text-sm font-semibold">Welcome back, {data?.user?.email}</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        {tempHistory.map((item) => {
          const isActive = item.id === pathname;
          return (
            <SidebarGroup key={item.title}>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <AppSidebarMenuButton url={`/chat/${item.id}`} active={isActive}>
                      {item.title}
                    </AppSidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          )
        })}
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <span>OVERDRIVE TECH</span>
      </SidebarFooter>
    </Sidebar>
  );
}
