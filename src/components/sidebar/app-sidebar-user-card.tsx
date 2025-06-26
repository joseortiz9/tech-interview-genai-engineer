import { LogoutButton } from "@/components/logout-button";
import { Card } from "@/components/ui/card";
import type { UserResponse } from "@supabase/supabase-js";
import { use } from "react";

interface AppSidebarUserCardProps {
  promise: Promise<UserResponse>;
}

export const AppSidebarUserCard = ({ promise }: AppSidebarUserCardProps) => {
  const { data } = use(promise);
  return (
    <Card>
      <div className="flex flex-col gap-2 p-4">
        <span className="text-sm font-semibold text-muted-foreground">
          Welcome back, {data?.user?.email}
        </span>
        <LogoutButton />
      </div>
    </Card>
  );
};
