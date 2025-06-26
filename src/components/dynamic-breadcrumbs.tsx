"use client";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export function DynamicBreadcrumbs() {
  const pathname = usePathname(); // Get the current pathname [^1]

  // Skip rendering breadcrumbs on the homepage
  if (pathname === "/") {
    return null;
  }

  // Split the pathname into segments and remove empty segments
  const segments = pathname.split("/").filter(Boolean);

  // Generate breadcrumb items from path segments
  const breadcrumbItems = segments.map((segment, index) => {
    // Create the path for this breadcrumb item
    const href = `/${segments.slice(0, index + 1).join("/")}`;

    // Format the segment for display (capitalize and replace hyphens with spaces)
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());

    // Check if this is the last segment (current page)
    const isLastSegment = index === segments.length - 1;

    return {
      href,
      label,
      isLastSegment,
    };
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home breadcrumb */}
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href="/">
              <Home className="h-4 w-4" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {/* Dynamic breadcrumbs based on the current path */}
        {breadcrumbItems.map((item) => (
          <React.Fragment key={item.href}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {item.isLastSegment ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
