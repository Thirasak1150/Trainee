"use client"

import * as React from "react"
import { useEffect } from "react"
import {
  IconNetwork,
  IconSettings,
  IconFolder,
  IconPhoneSpark,
  IconUser,
  IconLockCode,
} from "@tabler/icons-react";
import { ComponentType } from "react";
import { IconProps } from "@tabler/icons-react";
import { ImSpinner2 } from "react-icons/im";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { useUser } from "../Usercontext";
import IconTechnomic from "@/components/ui/IconTechnomic";
import axios from "axios";
import { NavCustom } from "./nav-custom";
import { getCookie } from "./get-cookie";
import Link from "next/link";


type MenuItem = {
  name: string;
  url: string;
  icon: ComponentType<IconProps>;
};

type MenuHeader = {
  headerName: string;
  items: MenuItem[];
  order_index: number;
  menu_headers_id: number;
};



export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { Fullname, Useremail, user_uuid } = useUser();
  const [mounted, setMounted] = React.useState(false);
  const [menuHeaders, setMenuHeaders] = React.useState<MenuHeader[]>([]);
  const [user_id, setUser_id] = React.useState(user_uuid || getCookie("user_uuid") || "");
  React.useEffect(() => setMounted(true), []);

  const profileData = {
    name: Fullname || getCookie("full_name") || "",
    email: Useremail || getCookie("email") || "",
    avatar: "/avatars/shadcn.jpg",
  };

  // Map icon names to Tabler icons
  const getIconComponent = React.useCallback((iconName: string): ComponentType<IconProps> => {
    console.log("iconName", iconName);
    const iconMap: Record<string, ComponentType<IconProps>> = {
      "accounts": IconUser,
      "menu-manager": IconFolder,
      "access-controls": IconLockCode ,
      "account-setting": IconSettings,
      "domains": IconNetwork,
      "extensions": IconPhoneSpark,
    };
    return iconMap[iconName.toLowerCase()] || IconNetwork;
  }, []);

  const fetchMenus = React.useCallback(async (user_uuid: string) => {
    console.log("user_uuid", user_id);
    try {
      const response = await axios.get(`http://localhost:8000/api/menu/${user_id}`);
      console.log("response", response.data.length);
      if (response.data.length == 0 || response.data.length == undefined) {
        console.log("No data returned");
        setUser_id(user_uuid);
        return;
      }
      // แปลงข้อมูลให้เป็น array ของ header ที่มีเมนูย่อยในรูปแบบที่ NavMain, NavDocuments, NavSecondary คาดหวัง
      const headers: MenuHeader[] = response.data.map((header: unknown) => {
        const h = header as Record<string, unknown>;
        return {
          headerName: (h.name_custom as string) || (h.name_default as string) || "No Name",
          headerIcon: getIconComponent((h.icon as string) || "folder"),
          items: ((h.menu_items as unknown[]) || []).map((item) => {
            const i = item as Record<string, unknown>;
            return {
              name: (i.name_custom as string) || (i.name_default as string) || "Unnamed",
              url: (i.path as string) || "#",
              icon: getIconComponent((i.icon as string) || "folder"),
            };
          }),
          order_index: h.order_index as number,
          menu_headers_id: h.menu_headers_id as number,
        };
      });

      setMenuHeaders(headers);
      console.log("Menus loaded:", headers);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }
  }, [user_id, getIconComponent]);
  // โหลดทุก  1 วิ 5 ครั้ง
  useEffect(() => {
    if (menuHeaders.length > 0) return;
    console.log("user_uuid", user_uuid);
    const uuid = user_uuid || getCookie("user_uuid");
    if (uuid) {
      setUser_id(uuid);
      fetchMenus(uuid);
    }
    const interval = setInterval(() => {
      console.log("user_uuid", user_uuid);
      const uuid = user_uuid || getCookie("user_uuid");
      if (uuid) {
        setUser_id(uuid);
        fetchMenus(uuid);
      }
    }, 1000 * 5);
    return () => clearInterval(interval);
  }, [fetchMenus, menuHeaders.length, user_uuid]);
  
  if (!mounted) return null; // รอให้ client mount ก่อน render

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconTechnomic width={40} height={30} />
                <span className="text-base font-semibold">Tecnomic</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {/* แสดงชื่อผู้ใช้ใต้โลโก้ */}
        {/* <div className="p-4 text-center">
          <div className="font-medium">{profileData.name}</div>
          <div className="text-xs text-muted-foreground">{profileData.email}</div>
        </div> */}
      </SidebarHeader>
          {menuHeaders.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <ImSpinner2 className="animate-spin" />
            </div>
          ) : (
      <SidebarContent>
        {menuHeaders
          .sort((a, b) => a.order_index - b.order_index)
          .map((header) => (
            <NavCustom 
              key={header.menu_headers_id}
              name={header.headerName || "Unnamed Header"}
             
              items={header.items}
            />
          ))}
      </SidebarContent>
      )}
      <SidebarFooter>
        <NavUser user={profileData} />
      </SidebarFooter>
    </Sidebar>
  );
}
