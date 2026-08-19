'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Wrench,
    Ticket,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    X,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import Image from 'next/image';

const menuItems = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/clients', icon: Users, label: 'Clientes' },
    { href: '/services', icon: Wrench, label: 'Servicios' },
    { href: '/tickets', icon: Ticket, label: 'Tickets' },
    { href: '/settings', icon: Settings, label: 'Configuración' },
];

interface SidebarProps {
    isOpen?: boolean;
    onClose?: () => void;
    isMobile?: boolean;
    isCollapsed?: boolean;
    onToggleCollapse?: () => void;
}

export function Sidebar({
    isOpen = true,
    onClose,
    isMobile = false,
    isCollapsed = false,
    onToggleCollapse,
}: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const { logout } = useAuth();
    const [showLogoutDialog, setShowLogoutDialog] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await logout();
            router.push('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            setIsLoggingOut(false);
            setShowLogoutDialog(false);
        }
    };

    // Si es móvil y está cerrado, no renderizar
    if (isMobile && !isOpen) return null;

    return (
        <>
            {/* Overlay para móvil */}
            {isMobile && isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                />
            )}

            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
                    isMobile ? "w-72" : (isCollapsed ? "w-20" : "w-64"),
                    isMobile && isOpen ? "translate-x-0" : (isMobile ? "-translate-x-full" : "translate-x-0")
                )}
            >
                {/* Logo y header del sidebar */}
                <div className={cn(
                    "flex items-center h-16 px-4 border-b border-gray-200 flex-shrink-0",
                    isCollapsed && !isMobile ? "justify-center" : "justify-between"
                )}>
                    <Link href="/dashboard" className="flex items-center gap-2 min-w-0">
                        {/* Logo - Reemplaza la ruta con tu logo */}
                        <div className="relative w-8 h-8 flex-shrink-0">
                            <Image
                                src="/logo-tecnofix.png"
                                alt="TECNOFIX"
                                width={32}
                                height={32}
                                className="object-contain"
                                priority
                            />
                        </div>
                        {(!isCollapsed || isMobile) && (
                            <span className="text-lg font-bold text-blue-600 truncate">
                                TECNOFIX
                            </span>
                        )}
                    </Link>

                    {!isMobile && onToggleCollapse && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onToggleCollapse}
                            className="h-8 w-8 p-0 flex-shrink-0"
                        >
                            {isCollapsed ? (
                                <ChevronRight className="h-4 w-4" />
                            ) : (
                                <ChevronLeft className="h-4 w-4" />
                            )}
                        </Button>
                    )}

                    {isMobile && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="h-8 w-8 p-0 flex-shrink-0"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    )}
                </div>

                {/* Navegación */}
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={isMobile ? onClose : undefined}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                                    isActive
                                        ? "bg-blue-50 text-blue-600 shadow-sm"
                                        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
                                    isCollapsed && !isMobile && "justify-center px-2"
                                )}
                            >
                                <item.icon className={cn(
                                    "h-5 w-5 flex-shrink-0",
                                    isActive ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"
                                )} />
                                {(!isCollapsed || isMobile) && (
                                    <span className="truncate">{item.label}</span>
                                )}
                                {isCollapsed && !isMobile && (
                                    <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Footer del sidebar - Cerrar sesión */}
                <div className="p-3 border-t border-gray-200 flex-shrink-0">
                    <button
                        onClick={() => setShowLogoutDialog(true)}
                        className={cn(
                            "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors relative group",
                            isCollapsed && !isMobile && "justify-center px-2"
                        )}
                    >
                        <LogOut className="h-5 w-5 flex-shrink-0" />
                        {(!isCollapsed || isMobile) && <span>Cerrar Sesión</span>}
                        {isCollapsed && !isMobile && (
                            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                Cerrar Sesión
                            </span>
                        )}
                    </button>
                </div>
            </aside>

            {/* Diálogo de confirmación de logout */}
            <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Estás seguro de que deseas cerrar sesión? Deberás volver a iniciar sesión para acceder al sistema.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isLoggingOut}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isLoggingOut ? 'Cerrando sesión...' : 'Sí, cerrar sesión'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}