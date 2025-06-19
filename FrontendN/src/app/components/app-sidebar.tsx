"use client"

import * as React from "react";
import { useEffect } from "react";
import type { ComponentType } from "react";
import {
  IconNetwork,
  IconSettings,
  IconFolder,
  IconPhoneSpark,
  IconUser,
  IconLockCode,
  IconLoader2,
  IconAddressBook,
} from "@tabler/icons-react";

type IconType = React.ComponentProps<typeof IconNetwork>;
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import IconTechnomic from "@/components/ui/IconTechnomic";
import axios from "axios";
import { NavCustom } from "./nav-custom";
import { getCookie } from "./get-cookie";
import {Link} from "react-router-dom"
import { useSelector } from "react-redux";
import type { RootState } from "@/Store/store";
type MenuItem = {
  name: string;
  url: string;
  icon: ComponentType<IconType>;
};

export type MenuHeader = {
  headerName: string;
  items: MenuItem[];
  order_index: number;
  menu_headers_id: number;
};



export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  //จำลองข้อมูล
  const { user_uuid, fullName, userEmail } = useSelector((state: RootState) => state.user);
  const Fullname = fullName
  const Useremail = userEmail
  const [menu, setMenu] = React.useState<MenuHeader[]>([])
  const [isLoading, setIsLoading] = React.useState(false);
  const [menuHeaders, setMenuHeaders] = React.useState<MenuHeader[]>([]);
  // removed redundant user_id state
  const [mounted, setMounted] = React.useState(false);

  const profileData = {
    name: Fullname || getCookie("full_name") || "",
    email: Useremail || getCookie("email") || "",
    avatar: "/avatars/shadcn.jpg",
  };

  // Map icon names to Tabler icons
  const getIconComponent = React.useCallback((iconName: string): ComponentType<IconType> => {
    console.log("iconName", iconName);
    const iconMap: Record<string, ComponentType<IconType>> = {
      "accounts": IconUser,
      "menu-manager": IconFolder,
      "access-controls": IconLockCode ,
      "account-setting": IconSettings,
      "domains": IconNetwork,
      "extensions": IconPhoneSpark,
      "contacts": IconAddressBook ,
    };
    return iconMap[iconName.toLowerCase()] || IconNetwork;
  }, []);

  const fetchMenus = React.useCallback(async (user_uuid: string) => {
    console.log("user_uuid", user_uuid);
    // ใส่ดีเลย์ 2 วินาที
    // await new Promise(resolve => setTimeout(resolve, 1000));
    try {
      const response = await axios.get(`http://localhost:8000/api/menu/${user_uuid}`);
      console.log("response", response.data.length);
      if (!response.data?.length) {
        console.log("No data returned");
        return;
      }
      // แปลงข้อมูลให้เป็น array ของ header ที่มีเมนูย่อยในรูปแบบที่ NavMain, NavDocuments, NavSecondary คาดหวัง
      const headers: MenuHeader[] = response.data.map((header: unknown) => {
        const h = header as Record<string, unknown>;
        return {
          headerName: (h.name_custom as string) || (h.name_default as string) || "No Name",
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
      setMenu(headers);
      console.log("Menus loaded:", headers);
    } catch (error) {
      console.error("Error fetching menus:", error);
    }

  }, [getIconComponent, menu, setMenu]);
  // โหลดทุก  1 วิ 5 ครั้ง
  useEffect(() => {
    const uuid = user_uuid || getCookie("user_uuid");
    if (!uuid) return;
    console.log("menu app sidebar", menu);
    if (menu.length > 0) return;
    console.log("menu app sidebar2", menu);
    // initial load
    setIsLoading(true);
    fetchMenus(uuid).finally(() => setIsLoading(false));

    // refresh every 5s if you really need live updates
    const interval = setInterval(() => fetchMenus(uuid), 5000);
    return () => clearInterval(interval);
  }, [fetchMenus, user_uuid]);

  useEffect(() => setMounted(true), []);

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
              <Link to="/">
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
            isLoading ? (
              <div className="flex items-center justify-center p-4">
                <IconLoader2 className="animate-spin h-5 w-5 text-blue-500" />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <IconLoader2 className="animate-spin h-5 w-5" />
              </div>
            )
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
