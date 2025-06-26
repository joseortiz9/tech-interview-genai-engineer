"use client";

import { SidebarMenuButton } from "@/components/ui/sidebar";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";

export function AppSidebarMenuButton({
  url,
  active,
  children,
}: React.PropsWithChildren<{ url: string; active: boolean }>) {
  const [isActive, setisActive] = useState<boolean | undefined>(undefined);
  const pathname = usePathname();

  useEffect(() => {
    if (pathname === url) {
      setisActive(true);
    } else {
      setisActive(false);
    }
  });

  return (
    <SidebarMenuButton asChild isActive={isActive ?? active}>
      <Link href={url}>{children}</Link>
    </SidebarMenuButton>
  );
}
