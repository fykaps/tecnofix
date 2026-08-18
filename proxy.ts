import { NextRequest, NextResponse } from 'next/server';

// Configuración del proxy
export const config = {
    runtime: 'nodejs',
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|api/auth/login|api/auth/logout).*)',
    ],
};

const SESSION_MAX_AGE = 60 * 60; // 1 hora en segundos
const SESSION_MAX_AGE_MS = SESSION_MAX_AGE * 1000;
const SESSION_COOKIE_NAME = 'tecnoFix_auth';

export function proxy(request: NextRequest) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Obtener la cookie de sesión
    const authCookie = request.cookies.get(SESSION_COOKIE_NAME);

    // Verificar si la sesión es válida
    let isAuthenticated = false;
    let sessionData: { user: string; timestamp: number } | null = null;

    if (authCookie) {
        try {
            sessionData = JSON.parse(decodeURIComponent(authCookie.value));
            const now = Date.now();
            const sessionAge = now - (sessionData.timestamp || 0);

            // Verificar que la sesión no haya expirado (1 hora)
            if (sessionData.user && sessionAge < SESSION_MAX_AGE_MS) {
                isAuthenticated = true;
            } else {
                // Sesión expirada - eliminar cookie
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete(SESSION_COOKIE_NAME);
                return response;
            }
        } catch (error) {
            // Cookie inválida - eliminar
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete(SESSION_COOKIE_NAME);
            return response;
        }
    }

    // Si está en la ruta de login y ya tiene sesión, redirigir a dashboard
    if (pathname === '/login' && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Si está en ruta protegida y no tiene sesión, redirigir a login
    const isProtectedRoute =
        pathname === '/' ||
        pathname.startsWith('/dashboard') ||
        pathname.startsWith('/clients') ||
        pathname.startsWith('/services') ||
        pathname.startsWith('/tickets') ||
        pathname.startsWith('/settings');

    if (isProtectedRoute && !isAuthenticated) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Si la sesión está cerca de expirar (menos de 5 minutos), renovar
    if (isAuthenticated && sessionData) {
        const now = Date.now();
        const sessionAge = now - (sessionData.timestamp || 0);
        const remainingTime = SESSION_MAX_AGE_MS - sessionAge;

        // Renovar si quedan menos de 5 minutos (300 segundos)
        if (remainingTime < 5 * 60 * 1000) {
            const response = NextResponse.next();
            const newSessionData = {
                ...sessionData,
                timestamp: now,
            };
            response.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(newSessionData), {
                maxAge: SESSION_MAX_AGE,
                path: '/',
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
            });
            return response;
        }
    }

    // Continuar normalmente
    return NextResponse.next();
}