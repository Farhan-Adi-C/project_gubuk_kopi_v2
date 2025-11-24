"use client"

import * as React from "react"
import {
  IconDashboard,
  IconFolder,
  IconUsers,
  IconCoffee,
  IconTags,
  IconDatabase,
  IconReport,
  IconFileWord,
  IconInnerShadowTop,
  IconBook,
  IconMail,
  IconGrid4x4,
  IconClipboard
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Products",
      url: "/admin/products",
      icon: IconCoffee,
    },
    {
      title: "Categories",
      url: "/admin/categories",
      icon: IconTags,
    },
    {
      title: "Meja",
      url: "/admin/mejas",
      icon: IconGrid4x4,
    },
    {
      title: "Orders",
      url: "/admin/orders",
      icon: IconClipboard ,
    },
    {
      title: "Blogs",
      url: "/admin/blogs",
      icon: IconBook,
    },
    {
      title: "Message",
      url: "/admin/message",
      icon: IconMail,
    },
  ],
  
  documents: [
    {
      name: "Data Library",
      url: "/admin/data-library",
      icon: IconDatabase,
    },
    {
      name: "Reports",
      url: "/admin/reports",
      icon: IconReport,
    },
    {
      name: "Word Assistant",
      url: "/admin/word-assistant",
      icon: IconFileWord,
    },
  ],
}

export function AppSidebar(props) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/admin">
                <span className="text-base font-semibold">Gubuk Kopi</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} pathname={pathname} />
        {/* <NavDocuments items={data.documents} pathname={pathname} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}