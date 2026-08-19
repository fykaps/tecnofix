"use client";

import * as React from "react";
import {
    LayoutDashboard,
    Wrench,
    Users,
    Ticket,
    Settings,
    HelpCircle,
    Search,
} from "lucide-react";

import { NavMain } from "@/components/layout/NavMain";
import { NavSecondary } from "@/components/layout/NavSecondary";
import { NavUser } from "@/components/layout/NavUser";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useAuth } from "@/contexts/AuthContext";

const data = {
    user: {
        name: "Admin TECNOFIX",
        email: "admin@tecnofix.com",
        avatar: "/avatars/admin.jpg",
    },
    navMain: [
        {
            title: "Dashboard",
            url: "/dashboard",
            icon: LayoutDashboard,
        },
        {
            title: "Servicios",
            url: "/services",
            icon: Wrench,
        },
        {
            title: "Clientes",
            url: "/clients",
            icon: Users,
        },
        {
            title: "Tickets",
            url: "/tickets",
            icon: Ticket,
        },
    ],
    navSecondary: [
        {
            title: "Configuración",
            url: "#",
            icon: Settings,
        },
        {
            title: "Ayuda",
            url: "#",
            icon: HelpCircle,
        },
        {
            title: "Buscar",
            url: "#",
            icon: Search,
        },
    ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { user } = useAuth();
    const displayName = user || "Usuario";

    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        {/* ✅ Eliminamos asChild y usamos href directamente */}
                        <SidebarMenuButton className="data-[slot=sidebar-menu-button]:p-1.5!">
                            <a href="/dashboard" className="flex items-center gap-2">
                                <span className="text-base font-semibold">TECNOFIX</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
                <NavSecondary items={data.navSecondary} className="mt-auto" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser
                    user={{
                        name: displayName,
                        email: "admin@tecnofix.com",
                        avatar: "",
                    }}
                />
            </SidebarFooter>
        </Sidebar>
    );
}