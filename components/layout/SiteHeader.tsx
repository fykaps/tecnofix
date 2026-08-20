"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
// import { Github } from "lucide-react";

export function SiteHeader() {
    const pathname = usePathname();

    const getPageTitle = () => {
        const routes: Record<string, string> = {
            "/dashboard": "Dashboard",
            "/clients": "Clientes",
            "/clients/new": "Nuevo Cliente",
            "/services": "Servicios",
            "/services/new": "Nuevo Servicio",
            "/tickets": "Tickets",
        };
        return routes[pathname] || "TECNOFIX";
    };

    return (
        <header className="flex h-(--header-height) shrink-0 items-center border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center px-4 lg:px-6">
                <SidebarTrigger className="-ml-1" />

                <div className="mx-2 h-5 w-px bg-gray-200 self-center" />

                <h1 className="text-base font-medium">{getPageTitle()}</h1>

                <div className="ml-auto flex items-center gap-2">
                    {/* <a
                        href="https://github.com/tu-usuario/tecnoFix-system"
                        rel="noopener noreferrer"
                        target="_blank"
                        className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                    >
                        <Github className="h-4 w-4" />
                        GitHub
                    </a> */}
                </div>
            </div>
        </header>
    );
}