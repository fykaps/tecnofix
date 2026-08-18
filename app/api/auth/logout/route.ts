import { NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'tecnoFix_auth';

export async function POST() {
    const response = NextResponse.json({ success: true });

    // Eliminar cookie
    response.cookies.delete(SESSION_COOKIE_NAME);

    return response;
}