"use client";

import { CirclePlus, Mail, type LucideIcon } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavMain({
    items,
}: {
    items: {
        title: string;
        url: string;
        icon?: LucideIcon;
    }[];
}) {
    const router = useRouter();

    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    <SidebarMenuItem className="flex items-center gap-2">
                        {/* ✅ Eliminamos asChild y usamos onClick directo */}
                        <SidebarMenuButton
                            tooltip="Nuevo Servicio"
                            className="min-w-8 bg-blue-600 text-white duration-200 ease-linear hover:bg-blue-700 hover:text-white active:bg-blue-700 active:text-white"
                            onClick={() => router.push("/services/new")}
                        >
                            <CirclePlus className="h-4 w-4" />
                            <span>Nuevo Servicio</span>
                        </SidebarMenuButton>
                        <Button
                            size="icon"
                            className="size-8 group-data-[collapsible=icon]:opacity-0"
                            variant="outline"
                            onClick={() => router.push("/clients")}
                        >
                            <Mail className="h-4 w-4" />
                            <span className="sr-only">Clientes</span>
                        </Button>
                    </SidebarMenuItem>
                </SidebarMenu>
                <SidebarMenu>
                    {items.map((item) => (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton tooltip={item.title}>
                                <a href={item.url} className="flex items-center gap-2 w-full">
                                    {item.icon && <item.icon className="h-4 w-4" />}
                                    <span>{item.title}</span>
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    );
}