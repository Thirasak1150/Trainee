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
import Link from "next/link";
import { usePathname } from "next/navigation";

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

  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>
       
        <span className="align-middle">{name}</span>
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
  
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton asChild variant={pathname === item.url ? "primary" : "default"}>
              <Link href={item.url}>
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
