// "use client"

// import * as React from "react"
// import {
//   IconBrightness,
//   IconCamera,
//   IconChartBar,
//   IconDashboard,
//   IconDatabase,
//   IconFileAi,
//   IconFileDescription,
//   IconFileWord,
//   IconFolder,
//   IconHelp,
//   IconListDetails,
//   IconLogout,
//   IconReport,
//   IconSearch,
//   IconSettings,
//   IconUsers,
// } from "@tabler/icons-react"


// import {
//   Sidebar,
//   SidebarContent,
//   SidebarFooter,
//   SidebarHeader,
//   SidebarMenu,
//   SidebarMenuButton,
//   SidebarMenuItem,
// } from "@/components/ui/sidebar"
// import { NavMain } from "./nav-main"
// import { NavDocuments } from "./nav-documents"
// import { NavSecondary } from "./nav-secondary"
// import { NavUser } from "./nav-user"
// import { DotLottieReact } from "@lottiefiles/dotlottie-react"
// import { NavCustom } from "./nav-custom"

// const data = {
//   user: {
//     name: "Technomic",
//     email: "Technomic@example.com",
//     avatar: "/avatars/shadcn.jpg",
//   },
//   navSecondary: [
//     {
//       title: "Settings",
//       url: "#",
//       icon: IconSettings,
//     },
//     {
//       title: "Get Help",
//       url: "#",
//       icon: IconHelp,
//     },
//     {
//       title: "Dark Mode",
//       url: "#",
//       icon: IconBrightness,
//     },
//     {
//       title: "Logout",
//       url: "#",
//       icon: IconLogout,
//     }
//   ],
// }

// export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
//   // const [menuDefault, setMenuDefault] = useState<MenuGroup[]>([
//   // {
//   //   name: "Home",
//   //  
//   //   children: [
//   //     {
//   //       name: "Account Settings",
//   //       url: "/Home/Account_Settings",
//   //       icon: IconDatabase,
//   //     
//   //     },
//   //     {
//   //       name: "Dashboard",
//   //       url: "/Home/Dashboard",
//   //       icon: IconDatabase,
//   //    
//   //     }
//   //   ]
//   // },
//   // {
//   //   name: "Accounts",
//   //   children: [
//   //     {
//   //       name: "Devices",
//   //       url: "/Accounts/Devices",
//   //       icon: IconDatabase,

//   //     },
//   //     {
//   //       name: "Extensions",
//   //       url: "/Accounts/Extensions",
//   //       icon: IconDatabase,
// "
//   //     },
//   //     {
//   //       name: "Gateways",
//   //       url: "/Accounts/Gateway",
//   //       icon: IconDatabase,
//   //
//   //     },
//   //     {
//   //       name: "Users",
//   //       url: "/Accounts/User",
//   //       icon: IconDatabase,
//   //      
//   //     }
//   //   ]
//   // },
//   // {
//   //   name: "DiaLplan",
//   //   children: [
//   //     {
//   //       name: "Destinations",
//   //       url: "/Diaplan/Destinations",
//   //       icon: IconDatabase,
//   //     },
//   //     {
//   //       name: "Dialplan Manager",
//   //       url: "/Diaplan/Dialplan_Manager",
//   //       icon: IconDatabase,
//   //     },
//   //     {
//   //       name: "Inbound Routes",
//   //       url: "/Diaplan/Inbound_Routes",
//   //       icon: IconDatabase,
//   //     },
//   //     {
//   //       name: "Outbound Routes",
//   //       url: "/Diaplan/Outbound_Routes",
//   //       icon: IconDatabase,
//   //     }
//   //   ]
//   // },
//   // {
//   //   name: "Application",
//   //   children: [
//   //     {
//   //       name: "Bridges",
//   //       url: "/Application/Bridges",
//   //       icon: IconDatabase,
//   //     },
//   //     {
//   //       name: "Call Block",
//   //       url: "/Application/Call_Block",
//   //       icon: IconDatabase,
//   //     },
//   //     {
//   //       name: "Call Broadcast",
//   //       url: "/Application/Call_Broadcast",
//   //       icon: IconDatabase,
//   //     },
//   //     {
//   //       name: "Call Centers",
//   //       url: "/Application/Call_Centers",
//   //       icon: IconDatabase,
//   //     },
//   //     {
//   //       name: "Call Flows",
//   //       url: "/Application/Call_Flows",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Call Forward",
//   //       url: "/Application/Call_Forward",
//   //       icon: IconDatabase,
//   /
//   //     },
//   //     {
//   //       name: "Call Recordings",
//   //       url: "/Application/Call_Recordings",
//   //       icon: IconDatabase,
//   /
//   //     },
//   //     {
//   //       name: "Conference Centers",
//   //       url: "/Application/Conference_Centers",
//   //       icon: IconDatabase,
  
//   //     },
//   //     {
//   //       name: "Conference Controls",
//   //       url: "/Application/Conference_Controls",
//   //       icon: IconDatabase,
//   //       
//   //     },
//   //     {
//   //       name: "Conference Profiles",
//   //       url: "/Application/Conference_Profiles",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Conferences",
//   //       url: "/Application/Conferences",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Contacts",
//   //       url: "/Application/Contacts",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Fax Server",
//   //       url: "/Application/Fax_Server",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Follow Me",
//   //       url: "/Application/Follow_Me",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "IVR Menus",
//   //       url: "/Application/IVR_Menus",
//   //       icon: IconDatabase,
//   //       
//   //     },
//   //     {
//   //       name: "Music on Hold",
//   //       url: "/Application/Music_on_Hold",
//   //       icon: IconDatabase,
//   //   
//   //     },
//   //     {
//   //       name: "Operator Panel",
//   //       url: "/Application/Operator_Panel",
//   //       icon: IconDatabase,
//   //       
//   //     },
//   //     {
//   //       name: "Phrases",
//   //       url: "/Application/Phrases",
//   //       icon: IconDatabase,
//   //     
//   //     },
//   //     {
//   //       name: "Queues",
//   //       url: "/Application/Queues",
//   //       icon: IconDatabase,
//   //
//   //     },
//   //     {
//   //       name: "Recordings",
//   //       url: "/Application/Recordings",
//   //       icon: IconDatabase,
//   //       
//   //     },
//   //     {
//   //       name: "Ring Groups",
//   //       url: "/Application/Ring_Groups",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Streams",
//   //       url: "/Application/Streams",
//   //       icon: IconDatabase,
//   //       
//   //     },
//   //     {
//   //       name: "Time Conditions",
//   //       url: "/Application/Time_Conditions",
//   //       icon: IconDatabase,
//   //       
//   //     },
//   //     {
//   //       name: "Voicemail",
//   //       url: "/Application/Voicemail",
//   //       icon: IconDatabase,
//   //       
//   //   ]
//   // },
//   // {
//   //   name: "Status",
//   //   menu_item_uuid: "1a94a2b0-7fca-4272-9e6a-d39a93e8afd3",
//   //   children: [
//   //     {
//   //       name: "Active Call Center",
//   //       url: "/Status/Active_Call_Center",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Active Calls",
//   //       url: "/Status/Active_Calls",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Active Conferences",
//   //       url: "/Status/Active_Conferences",
//   //       icon: IconDatabase,
 
//   //     },
//   //     {
//   //       name: "Active Queues",
//   //       url: "/Status/Active_Queues",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Agent Status",
//   //       url: "/Status/Agent_Status",
//   //       icon: IconDatabase,
//   //    
//   //     },
//   //     {
//   //       name: "CDR Statistics",
//   //       url: "/Status/CDR_Statistics",
//   //       icon: IconDatabase,
//   // 
//   //     },
//   //     {
//   //       name: "Email Queue",
//   //       url: "/Status/Email_Queue",
//   //       icon: IconDatabase,
//   //       
//   //     },
//   //     {
//   //       name: "Event Guard",
//   //       url: "/Status/Event_Guard",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Extension Summary",
//   //       url: "/Status/Extension_Summary",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "FAX Queue",
//   //       url: "/Status/FAX_Queue",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Log Viewer",
//   //       url: "/Status/Log_Viewer",
//   //       icon: IconDatabase,
//   //    
//   //     },
//   //     {
//   //       name: "Registrations",
//   //       url: "/Status/Registrations",
//   //       icon: IconDatabase,
//   //       
//   //     },
//   //     {
//   //       name: "SIP Status",
//   //       url: "/Status/SIP_Status",
//   //       icon: IconDatabase,
//   /
//   //     },
//   //     {
//   //       name: "System Status",
//   //       url: "/Status/System_Status",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "User Logs",
//   //       url: "/Status/User_Logs",
//   //       icon: IconDatabase,
//   //
//   //     }
//   //   ]
//   // },
//   // {
//   //   name: "Advance",
//   //   
//   //   children: [
//   //     {
//   //       name: "Access Controls",
//   //       url: "/Advance/Access_Controls",
//   //       icon: IconDatabase,
//   // 
//   //     },
//   //     {
//   //       name: "Databases",
//   //       url: "/Advance/Databases",
//   //       icon: IconDatabase,
//   //       
//   //     },
//   //     {
//   //       name: "Default Settings",
//   //       url: "/Advance/Default_Settings",
//   //       icon: IconDatabase,
//   //  
//   //     },
//   //     {
//   //       name: "Domains",
//   //       url: "/Advance/Domains",
//   //       icon: IconDatabase,
//   //     
//   //     },
//   //     {
//   //       name: "Email Templates",
//   //       url: "/Advance/Email_Templates",
//   //       icon: IconDatabase,
//   //   
//   //     },
//   //     {
//   //       name: "Group Manager",
//   //       url: "/Advance/Group_Manager",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Menu Manager",
//   //       url: "/Advance/Menu_Manager",
//   //       icon: IconDatabase,
//   //       
//   //     },
//   //     {
//   //       name: "Modules",
//   //       url: "/Advance/Modules",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Number Translations",
//   //       url: "/Advance/Number_Translations",
//   //       icon: IconDatabase,
//   /
//   //     },
//   //     {
//   //       name: "SIP Profiles",
//   //       url: "/Advance/SIP_Profiles",
//   //       icon: IconDatabase,
//   //      
//   //     },
//   //     {
//   //       name: "Transactions",
//   //       url: "/Advance/Transactions",
//   //       icon: IconDatabase,
//   //     
//   //     console.log("item menu_item_link",item.menu_item_link)
//   //     if (item.menu_item_link === null) return; // ข้ามกลุ่มเมนู
//   //     let found = false;
//   //     Object.keys(menuDefaultObj).forEach((groupKey) => {
//   //       console.log("groupKey",groupKey)
//   //       menuDefaultObj[groupKey].forEach((menuItem) => {
//   //         console.log("item.menu_item_title",item.menu_item_title)
//   //         console.log("item.menu_item_uuid",item.menu_item_uuid)
//   //         if (menuItem.name === item.menu_item_title) {
//   //           found = true;
//   //           if (menuItem.menu_item_uuid === item.menu_item_uuid) {
//   //             console.log(`✅ ตรงกัน: ${menuItem.name} uuid = ${menuItem.menu_item_uuid}`);
//   //           } else {
//   //             console.log(`❌ ไม่ตรงกัน: ${menuItem.name} | uuid ใน default: ${menuItem.menu_item_uuid} | uuid backend: ${item.menu_item_uuid}`);
//   //           }
//   //         }
//   //       });
//   //     });
//   //     if (!found) {
//   //       // console.log(`⚠️ มีใน backend แต่ไม่มีใน menuDefault: ${item.menu_item_title}`);
//   //     }
//   //   });

//   //   // 4. เช็คฝั่ง menuDefault ว่ามีชื่อที่ backend ไม่มีไหม
//   //   Object.keys(menuDefaultObj).forEach((groupKey) => {
//   //     menuDefaultObj[groupKey].forEach((menuItem) => {
//   //       if (!backendNames.has(menuItem.name)) {
//   //         // console.log(`⚠️ มีใน menuDefault แต่ไม่มีใน backend: ${menuItem.name}`);
//   //       }
//   //     });
//   //   });
//   // };



//   // // ฟังก์ชันเช็คว่า 2 เมนู array เหมือนกันไหม (ชื่อและ uuid)
//   // function isMenuEqual(menuA: any[], menuB: any[]) {
//   //   if (menuA.length !== menuB.length) return false;
//   //   for (let i = 0; i < menuA.length; i++) {
//   //     if (
//   //       menuA[i].name !== menuB[i].name ||
//   //       menuA[i].menu_item_uuid !== menuB[i].menu_item_uuid
//   //     ) {
//   //       return false;
//   //   }
//   // }
//   // return true;
//   //   fetchMenu();
//   //   // eslint-disable-next-line react-hooks/exhaustive-deps
//   // }, []);

//   return (
//     <Sidebar collapsible="offcanvas" {...props}>
//       <SidebarHeader>
//         <SidebarMenu>
//           <SidebarMenuItem>
//             <SidebarMenuButton
//               asChild
//               className="data-[slot=sidebar-menu-button]:!p-1.5"
//             >
//               <div className=" flex ">
//                 <DotLottieReact

//                   src="https://lottie.host/d6718db1-2790-44d8-8655-a56f0871c3af/p5GIsycg0R.lottie"
//                   className="w-8 h-8"
//                   loop
//                   autoplay
//                 />
//                 <span className="text-base font-semibold">Technomic</span>
//               </div>

//             </SidebarMenuButton>
//           </SidebarMenuItem>
//         </SidebarMenu>
//       </SidebarHeader>
//       <SidebarContent>
//         {/* <NavMain items={data.navMain} /> */}
//         {/* สามารถเลือกแสดง NavCustom ตามกลุ่มเมนูที่ต้องการได้ เช่น Application, Account, ... */}
//         <NavCustom name="Application" items={menuToShow} />
        
//         {/* <NavCustom name="Account" items={menu.Account} /> */}
//         <NavSecondary items={data.navSecondary} className="mt-auto" />
//       </SidebarContent>
//       <SidebarFooter>
//         <NavUser user={data.user} />
//       </SidebarFooter>
//     </Sidebar>
//   )
// }
