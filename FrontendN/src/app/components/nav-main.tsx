"use client"


import { useThemeConfig } from "@/components/ui/active-theme";
import { type Icon } from "@tabler/icons-react"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useLocation, useNavigate } from "react-router-dom";




export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: Icon;
  }[];
}) {
  const location = useLocation();
  const currentPath = location.pathname;

  const { activeTheme } = useThemeConfig();
  
  const navigate = useNavigate();

  function getActiveClass(theme: string) {
    switch (theme) {
      case "blue":
        return "bg-blue-600 text-white hover:bg-blue-700 hover:text-white";
      case "green":
        return "bg-green-600 text-white hover:bg-green-700 hover:text-white";
      case "amber":
        return "bg-amber-500 text-white hover:bg-amber-600 hover:text-white";
      case "default":
        return "bg-gray-900 text-white hover:bg-gray-800 hover:text-white";
      case "default-scaled":
        return "bg-gray-800 text-white hover:bg-gray-700 hover:text-white";
      case "blue-scaled":
        return "bg-blue-700 text-white hover:bg-blue-800 hover:text-white";
      case "mono-scaled":
        return "bg-neutral-900 text-white hover:bg-neutral-800 hover:text-white";
      default:
        return "bg-accent text-accent-foreground hover:bg-accent/90 hover:text-accent-foreground";
    }
  }

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {/* This section was cleared by the user, keeping it empty as per Step 109 */}
          <SidebarMenuItem className="flex items-center gap-2">
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title} className=' hover:scale-105 transition-all duration-300 ease-in-out'>
              <SidebarMenuButton
                tooltip={item.title}
                className={`  ${currentPath.startsWith(item.url) && item.url !== "#" ? getActiveClass(activeTheme) : ""}`}
                onClick={() => navigate(item.url)}
                asChild
              >
                <div > {/* Make the button a link */}
                  {item.icon && <item.icon />}
                  <span>{item.title}</span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
