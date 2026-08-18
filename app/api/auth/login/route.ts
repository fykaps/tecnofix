import { NextRequest, NextResponse } from 'next/server';

const SESSION_COOKIE_NAME = 'tecnoFix_auth';
const SESSION_MAX_AGE = 60 * 60; // 1 hora

// Credenciales válidas (solo estas funcionan)
const VALID_CREDENTIALS = {
    username: 'admin',
    password: 'tecno2026',
};

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, password } = body;

        // Validación estricta de credenciales
        const isValid =
            username === VALID_CREDENTIALS.username &&
            password === VALID_CREDENTIALS.password;

        // Log para depuración (en producción usar logger)
        console.log(`Intento de login: Usuario: ${username}, Válido: ${isValid}`);

        if (!isValid) {
            return NextResponse.json(
                {
                    error: 'Credenciales inválidas',
                    message: 'Usuario o contraseña incorrectos'
                },
                { status: 401 }
            );
        }

        // Crear datos de sesión
        const authData = {
            user: username,
            timestamp: Date.now(),
        };

        const response = NextResponse.json({
            success: true,
            user: username,
            message: 'Inicio de sesión exitoso',
        });

        // Establecer cookie con expiración de 1 hora
        response.cookies.set(SESSION_COOKIE_NAME, JSON.stringify(authData), {
            maxAge: SESSION_MAX_AGE,
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
        });

        return response;
    } catch (error) {
        console.error('Error en login:', error);
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                message: 'Ocurrió un error al procesar la solicitud'
            },
            { status: 500 }
        );
    }
}