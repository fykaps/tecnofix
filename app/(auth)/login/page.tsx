'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { Wrench, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login, isAuthenticated, isLoading: authLoading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Si ya está autenticado, redirigir al dashboard
    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, authLoading, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        // Validación básica en el cliente
        if (!username.trim()) {
            setError('El usuario es requerido');
            setIsLoading(false);
            return;
        }

        if (!password.trim()) {
            setError('La contraseña es requerida');
            setIsLoading(false);
            return;
        }

        try {
            const result = await login(username, password);

            if (result.success) {
                toast.add({
                    title: '¡Bienvenido!',
                    description: 'Inicio de sesión exitoso',
                    className: 'bg-green-50 border-green-200 text-green-800',
                });
                // La redirección se maneja en el contexto
            } else {
                setError(result.error || 'Credenciales inválidas');
                toast.add({
                    title: 'Error de autenticación',
                    description: result.error || 'Usuario o contraseña incorrectos',
                    variant: 'destructive',
                });
                // Limpiar campos en caso de error
                setPassword('');
            }
        } catch (error) {
            setError('Ocurrió un error al iniciar sesión');
            toast.add({
                title: 'Error',
                description: 'Ocurrió un error al iniciar sesión',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Mostrar loading mientras se verifica autenticación
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100">
                <div className="text-center">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Verificando sesión...</p>
                </div>
            </div>
        );
    }

    // Si ya está autenticado, no renderizar el login
    if (isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-100 p-4">
            <Card className="w-full max-w-md shadow-xl border-0">
                <CardHeader className="text-center space-y-2">
                    <div className="flex justify-center">
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-3 rounded-full shadow-lg">
                            <Wrench className="h-10 w-10 text-white" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold text-blue-600">TECNOFIX</CardTitle>
                    <CardDescription className="text-gray-500">
                        Sistema de Gestión de Servicio Técnico
                    </CardDescription>
                </CardHeader>

                <form onSubmit={handleSubmit} noValidate>
                    <CardContent className="space-y-4">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm border border-red-200 flex items-start gap-2">
                                <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-gray-700">
                                Usuario
                            </Label>
                            <Input
                                id="username"
                                type="text"
                                placeholder="Ingresa tu usuario"
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError('');
                                }}
                                required
                                className="focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                autoComplete="username"
                                disabled={isLoading}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-gray-700">
                                Contraseña
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Ingresa tu contraseña"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                                required
                                className="focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                autoComplete="current-password"
                                disabled={isLoading}
                            />
                        </div>

                        <div className="text-sm text-gray-500 flex items-center gap-2 bg-gray-50 p-3 rounded-md border border-gray-100">
                            <ShieldCheck className="h-4 w-4 text-blue-500 flex-shrink-0" />
                            <span>
                                Usuario: <strong className="font-mono">admin</strong> |
                                Contraseña: <strong className="font-mono">tecno2026</strong>
                            </span>
                        </div>
                    </CardContent>

                    <CardFooter>
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md hover:shadow-lg"
                            disabled={isLoading}
                            size="lg"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Iniciando sesión...
                                </>
                            ) : (
                                'Ingresar al Sistema'
                            )}
                        </Button>
                    </CardFooter>
                </form>

                <div className="px-6 pb-4 text-center">
                    <p className="text-xs text-gray-400">
                        Sistema protegido • TECNOFIX v1.0
                    </p>
                </div>
            </Card>
        </div>
    );
}