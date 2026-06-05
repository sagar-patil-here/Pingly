"use client";
import Link from "next/link";
import { MessageCircle, QrCode, CalendarClock, History, User } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const primaryNav = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: History,
  },
  {
    title: "Connect WhatsApp",
    url: "/dashboard/connect",
    icon: QrCode,
  },
  {
    title: "Scheduled Messages",
    url: "/dashboard/schedule",
    icon: CalendarClock,
  },
];

export function AppSidebar() {
  return (
    <Sidebar variant="inset">
      <SidebarHeader className="flex flex-row items-center gap-2 p-4 pt-6">
        <div className="bg-primary p-1.5 rounded-lg flex-shrink-0">
          <MessageCircle className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-bold text-xl tracking-tight leading-none truncate">Pingly</span>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 flex flex-row items-center gap-3 border-t border-border/50">
        <UserButton />
        <div className="flex flex-col text-sm truncate">
          <span className="truncate font-semibold">Account</span>
          <span className="truncate text-xs text-muted-foreground">Manage profile</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
