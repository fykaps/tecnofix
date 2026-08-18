'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
    isAuthenticated: boolean;
    user: string | null;
    isLoading: boolean;
    login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    checkAuth: () => boolean;
    sessionTimeRemaining: number | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_COOKIE_NAME = 'tecnoFix_auth';
const SESSION_MAX_AGE = 60 * 60; // 1 hora
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE * 1000;

// Rutas públicas
const PUBLIC_ROUTES = ['/login'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number | null>(null);

    // Verificar autenticación desde cookies
    const checkAuth = useCallback((): boolean => {
        if (typeof window === 'undefined') return false;

        try {
            const cookies = document.cookie.split(';');
            const authCookie = cookies.find(c => c.trim().startsWith(`${SESSION_COOKIE_NAME}=`));

            if (authCookie) {
                const value = authCookie.split('=')[1];
                const parsed = JSON.parse(decodeURIComponent(value));
                const now = Date.now();
                const sessionAge = now - (parsed.timestamp || 0);

                // Verificar que la sesión no haya expirado
                if (parsed.user && sessionAge < SESSION_MAX_AGE_MS) {
                    setIsAuthenticated(true);
                    setUser(parsed.user);
                    const remaining = Math.max(0, (SESSION_MAX_AGE_MS - sessionAge) / 1000);
                    setSessionTimeRemaining(remaining);
                    return true;
                } else {
                    // Sesión expirada - eliminar cookie
                    document.cookie = `${SESSION_COOKIE_NAME}=; max-age=0; path=/`;
                    setIsAuthenticated(false);
                    setUser(null);
                    setSessionTimeRemaining(null);
                    return false;
                }
            }
        } catch (error) {
            console.error('Error verificando autenticación:', error);
        }

        setIsAuthenticated(false);
        setUser(null);
        setSessionTimeRemaining(null);
        return false;
    }, []);

    // Login mejorado con validación
    const login = useCallback(async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
        try {
            // Validación local rápida
            if (!username || username.trim() === '') {
                return { success: false, error: 'El usuario es requerido' };
            }
            if (!password || password.trim() === '') {
                return { success: false, error: 'La contraseña es requerida' };
            }

            // Validación contra credenciales exactas (también en el cliente)
            const VALID_CREDENTIALS = {
                username: 'admin',
                password: 'tecno2026',
            };

            // Validación estricta en cliente
            if (username !== VALID_CREDENTIALS.username || password !== VALID_CREDENTIALS.password) {
                return { success: false, error: 'Usuario o contraseña incorrectos' };
            }

            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                setIsAuthenticated(true);
                setUser(username);
                setSessionTimeRemaining(SESSION_MAX_AGE);

                // Redirigir al dashboard inmediatamente
                router.push('/dashboard');

                return { success: true };
            } else {
                return {
                    success: false,
                    error: data.message || 'Credenciales inválidas'
                };
            }
        } catch (error) {
            console.error('Error en login:', error);
            return {
                success: false,
                error: 'Error de conexión al servidor'
            };
        }
    }, [router]);

    // Logout
    const logout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Error en logout:', error);
        }

        // Eliminar cookie manualmente
        document.cookie = `${SESSION_COOKIE_NAME}=; max-age=0; path=/`;
        setIsAuthenticated(false);
        setUser(null);
        setSessionTimeRemaining(null);

        // Redirigir al login
        router.push('/login');
    }, [router]);

    // Timer para actualizar tiempo restante
    useEffect(() => {
        if (!isAuthenticated) {
            setSessionTimeRemaining(null);
            return;
        }

        const interval = setInterval(() => {
            setSessionTimeRemaining(prev => {
                if (prev === null || prev <= 1) {
                    // Sesión expirada - cerrar automáticamente
                    logout();
                    return null;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isAuthenticated, logout]);

    // Efecto de inicialización
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const isAuth = checkAuth();
        const isPublicRoute = PUBLIC_ROUTES.some(route => pathname?.startsWith(route));

        // Si está autenticado y en ruta pública, redirigir a dashboard
        if (isAuth && isPublicRoute) {
            router.push('/dashboard');
        }

        // Si no está autenticado y en ruta protegida, redirigir a login
        if (!isAuth && !isPublicRoute) {
            router.push('/login');
        }

        setIsLoading(false);
    }, [checkAuth, pathname, router]);

    // Sincronización entre pestañas
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === SESSION_COOKIE_NAME) {
                checkAuth();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [checkAuth]);

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                isLoading,
                login,
                logout,
                checkAuth,
                sessionTimeRemaining,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}