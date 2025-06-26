import { BrandLogo } from "@/components/brand-logo";
import { AppSidebarChatsList } from "@/components/sidebar/app-sidebar-chats-list";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllChatsForSession } from "@/lib/rag/queries";
import { createClient } from "@/lib/supabase/server";
import { headers } from "next/headers";
import { Suspense } from "react";
import { AppSidebarUserCard } from "./app-sidebar-user-card";

const MenuListSkeleton = () => (
  <div className="mt-2 px-4 flex flex-col gap-2">
    <Skeleton className="w-full h-5" />
    <Skeleton className="w-full h-5" />
    <Skeleton className="w-full h-5" />
  </div>
);

export type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {};

export async function AppSidebar({ ...props }: AppSidebarProps) {
  const headerList = await headers();
  const pathname = headerList.get("x-current-path");
  const supabase = await createClient();
  const authPromise = supabase.auth.getUser();
  const chatsPromise = getAllChatsForSession();

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex flex-col">
              <BrandLogo />
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <Separator orientation="horizontal" />
        <Suspense fallback={<MenuListSkeleton />}>
          <AppSidebarChatsList
            chatsPromise={chatsPromise}
            pathname={pathname}
          />
        </Suspense>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter>
        <Suspense
          fallback={<Skeleton className="w-full h-[125px] rounded-xl" />}
        >
          <AppSidebarUserCard promise={authPromise} />
        </Suspense>
      </SidebarFooter>
    </Sidebar>
  );
}
