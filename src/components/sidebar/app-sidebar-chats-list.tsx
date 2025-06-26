import { AppSidebarMenuButton } from "@/components/sidebar/app-sidebar-menu-button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import type { ChatEntity } from "@/types";
import { use } from "react";

interface AppSidebarChatsListProps {
  chatsPromise: Promise<ChatEntity[]>;
  pathname: string | null;
}

export const AppSidebarChatsList = ({
  pathname,
  chatsPromise,
}: AppSidebarChatsListProps) => {
  const chats = use(chatsPromise);
  return (
    <>
      {chats.map((item) => {
        const isActive = item.id === pathname;
        return (
          <SidebarGroup key={item.title}>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <AppSidebarMenuButton
                    url={`/chat/${item.id}`}
                    active={isActive}
                  >
                    {item.title}
                  </AppSidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </>
  );
};
