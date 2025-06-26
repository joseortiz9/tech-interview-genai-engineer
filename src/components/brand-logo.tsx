"use client";

import { useTheme } from "next-themes";

export function BrandLogo() {
  const { theme } = useTheme();
  const src = theme === "dark" ? "/logo-white.svg" : "/logo-dark.svg";
  return (
    <div className="flex">
      <img src={src} alt="Brand Logo" className="h-10 w-full" />
    </div>
  );
}
