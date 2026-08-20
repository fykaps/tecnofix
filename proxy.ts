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

    const authCookie = request.cookies.get(SESSION_COOKIE_NAME);

    let isAuthenticated = false;
    let sessionData: { user: string; timestamp: number } | null = null;

    if (authCookie) {
        try {
            sessionData = JSON.parse(decodeURIComponent(authCookie.value));
            // ✅ Verificar que sessionData no sea null
            if (sessionData && sessionData.user) {
                const now = Date.now();
                const sessionAge = now - (sessionData.timestamp || 0);
                if (sessionAge < SESSION_MAX_AGE * 1000) {
                    isAuthenticated = true;
                }
            }
        } catch {
            const response = NextResponse.redirect(new URL('/login', request.url));
            response.cookies.delete(SESSION_COOKIE_NAME);
            return response;
        }
    }

    // ✅ Verificar sessionData antes de usarlo
    if (pathname === '/login' && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname === '/' && isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    if (pathname === '/' && !isAuthenticated) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // ✅ Verificar sessionData antes de usarlo
    if (isAuthenticated && sessionData) {
        const now = Date.now();
        const sessionAge = now - (sessionData.timestamp || 0);
        const remainingTime = SESSION_MAX_AGE * 1000 - sessionAge;

        if (remainingTime < 5 * 60 * 1000) {
            const response = NextResponse.next();
            const newSessionData = { ...sessionData, timestamp: now };
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