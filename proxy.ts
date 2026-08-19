import { NextRequest, NextResponse } from 'next/server';

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)',
    ],
};

const SESSION_COOKIE_NAME = 'tecnoFix_auth';
const SESSION_MAX_AGE = 60 * 60;

export function proxy(request: NextRequest) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    // Obtener la cookie de sesión
    const authCookie = request.cookies.get(SESSION_COOKIE_NAME);

    let isAuthenticated = false;
    let sessionData: { user: string; timestamp: number } | null = null;

    if (authCookie) {
        try {
            sessionData = JSON.parse(decodeURIComponent(authCookie.value));
            const now = Date.now();
            const sessionAge = now - (sessionData.timestamp || 0);

            if (sessionData.user && sessionAge < SESSION_MAX_AGE * 1000) {
                isAuthenticated = true;
            } else {
                const response = NextResponse.redirect(new URL('/login', request.url));
                response.cookies.delete(SESSION_COOKIE_NAME);
                return response;
            }
        } catch {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete(SESSION_COOKIE_NAME);
            return response;
        }
    }

    // Redirigir a dashboard si está en login y tiene sesión
    if (pathname === '/login' && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // ✅ PERMITIR ACCESO A LA PÁGINA PRINCIPAL (/)
    // Si está en la raíz y tiene sesión, redirigir a dashboard
    if (pathname === '/' && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Si está en la raíz y no tiene sesión, redirigir a login
    if (pathname === '/' && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // Proteger rutas del dashboard
    const isProtectedRoute =
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

    return NextResponse.next();
}