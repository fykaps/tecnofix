'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import { ShieldCheck, Loader2, AlertCircle } from 'lucide-react';

interface LoginFormProps {
    onSuccess?: () => void;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

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
                    type: 'success'
                });
                onSuccess?.();
            } else {
                setError(result.error || 'Credenciales inválidas');
                toast.add({
                    title: 'Error de autenticación',
                    description: result.error || 'Usuario o contraseña incorrectos',
                    type: 'error'
                });
                setPassword('');
            }
        } catch (error) {
            setError('Ocurrió un error al iniciar sesión');
            toast.add({
                title: 'Error',
                description: 'Ocurrió un error al iniciar sesión',
                type: 'error'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className='border-0 shadow-lg'>
            <CardHeader className='text-center'>
                <CardTitle className='text-xl'>Bienvenido de vuelta</CardTitle>
                <CardDescription>
                    Ingresa tus credenciales para acceder al sistema
                </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit} noValidate>
                <CardContent className='space-y-4'>
                    {/* Error */}
                    {error && (
                        <div className='flex items-start gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive'>
                            <AlertCircle className='h-4 w-4 mt-0.5 flex-shrink-0' />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Usuario */}
                    <div className='space-y-2'>
                        <Label htmlFor='username' className='text-sm font-medium'>
                            Usuario
                        </Label>
                        <Input
                            id='username'
                            type='text'
                            placeholder='admin'
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            required
                            className='transition-all focus-visible:ring-primary'
                            autoComplete='username'
                            disabled={isLoading}
                            autoFocus
                        />
                    </div>

                    {/* Contraseña */}
                    <div className='space-y-2'>
                        <div className='flex items-center justify-between'>
                            <Label htmlFor='password' className='text-sm font-medium'>
                                Contraseña
                            </Label>
                            <a
                                href='#'
                                className='text-sm text-muted-foreground underline-offset-4 hover:underline'
                            >
                                ¿Olvidaste tu contraseña?
                            </a>
                        </div>
                        <Input
                            id='password'
                            type='password'
                            placeholder='••••••••'
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                setError('');
                            }}
                            required
                            className='transition-all focus-visible:ring-primary'
                            autoComplete='current-password'
                            disabled={isLoading}
                        />
                    </div>

                    {/* Credenciales de prueba */}
                    <div className='flex items-center gap-2 rounded-md bg-muted/50 p-2.5 text-xs text-muted-foreground border border-border/50'>
                        <ShieldCheck className='h-3.5 w-3.5 text-primary flex-shrink-0' />
                        <span>
                            Demo: <strong className='font-mono text-foreground'>admin</strong>{' '}
                            <span className='text-muted-foreground'>•</span>{' '}
                            <strong className='font-mono text-foreground'>tecno2026</strong>
                        </span>
                    </div>
                </CardContent>

                <CardFooter>
                    <Button
                        type='submit'
                        className='w-full transition-all duration-200'
                        disabled={isLoading}
                        size='lg'
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                Iniciando sesión...
                            </>
                        ) : (
                            'Ingresar'
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}