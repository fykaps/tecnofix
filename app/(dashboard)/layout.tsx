"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { initializeStorage } from "@/lib/data/storage";
import { Loader2 } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { isAuthenticated, isLoading } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        initializeStorage();
    }, []);

    useEffect(() => {
        if (isMounted && !isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isAuthenticated, isLoading, router, isMounted]);

    // ✅ SOLUCIÓN: Siempre renderizar la misma estructura, sin importar el estado
    // Esto asegura que el servidor y el cliente siempre vean el mismo HTML
    return (
        <SidebarProvider
            style={
                {
                    "--sidebar-width": "calc(var(--spacing) * 72)",
                    "--header-height": "calc(var(--spacing) * 12)",
                } as React.CSSProperties
            }
        >
            <AppSidebar variant="inset" />
            <div className="flex flex-1 flex-col">
                <SiteHeader />
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
                        {(!isMounted || isLoading || !isAuthenticated) ? (
                            <div className="flex items-center justify-center h-64">
                                <div className="text-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto" />
                                    <p className="mt-4 text-gray-600">
                                        Cargando aplicación...
                                    </p>
                                </div>
                            </div>
                        ) : (
                            children
                        )}
                    </div>
                </div>
            </div>
        </SidebarProvider>
    );
}