"use client"

import { type IconProps } from "@tabler/icons-react";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import * as React from "react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useThemeConfig } from "@/components/ui/active-theme";

export function NavCustom({
  name,
  items,
}: {
  items: {
    name: string
    url: string
    icon: React.ComponentType<IconProps>
  }[]
  name: string,
}) {

  const pathname = useLocation();
  useThemeConfig();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
       
        <span className="align-middle">{name}</span>
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
  
          <SidebarMenuItem key={item.name}>
            {/* @ts-ignore */}
            <SidebarMenuButton asChild variant={pathname.pathname === item.url ? "primary" : "default"}>
              <Link to={item.url}>
                <item.icon />
                <span>{item.name}</span>
              </Link>
            </SidebarMenuButton>

          </SidebarMenuItem>
        ))}
   
      </SidebarMenu>
    </SidebarGroup>
  )
}
