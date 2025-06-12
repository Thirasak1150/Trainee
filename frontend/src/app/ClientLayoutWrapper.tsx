"use client";
import { ThemeProvider } from "next-themes";
import { usePathname } from "next/navigation";
import { ActiveThemeProvider } from "@/components/ui/active-theme";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/app/components/app-sidebar";
import { SiteHeader } from "./components/site-header";
import React from "react";

export default function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLogin = pathname === "/";
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {!isLogin ? (
        <ActiveThemeProvider>
          <SidebarProvider
            style={{
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties}
          >
            <AppSidebar variant="inset" />
            <SidebarInset>
              <SiteHeader />
              {children}
            </SidebarInset>
          </SidebarProvider>
        </ActiveThemeProvider>
      ) : (
        children
      )}
    </ThemeProvider>
  );
}
