'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { GalleryVerticalEnd, Loader2 } from 'lucide-react';
import { LoginForm } from '@/components/auth/LoginForm';

export default function LoginPage() {
    const router = useRouter();
    const { isAuthenticated, isLoading: authLoading } = useAuth();

    useEffect(() => {
        if (isAuthenticated && !authLoading) {
            router.push('/dashboard');
        }
    }, [isAuthenticated, authLoading, router]);

    if (authLoading) {
        return (
            <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
                <div className='text-center'>
                    <Loader2 className='h-10 w-10 animate-spin text-primary mx-auto' />
                    <p className='mt-4 text-muted-foreground'>Verificando sesión...</p>
                </div>
            </div>
        );
    }

    if (isAuthenticated) {
        return null;
    }

    const handleLoginSuccess = () => {
        router.push('/dashboard');
    };

    return (
        <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
            <div className='flex w-full max-w-sm flex-col gap-6'>
                {/* Logo y nombre */}
                <a href='#' className='flex items-center gap-2 self-center font-medium'>
                    <div className='flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm'>
                        <GalleryVerticalEnd className='size-4' />
                    </div>
                    TECNOFIX
                </a>

                {/* Formulario de Login */}
                <LoginForm onSuccess={handleLoginSuccess} />

                {/* Footer */}
                <p className='px-6 text-center text-xs text-muted-foreground'>
                    Sistema protegido • TECNOFIX v1.0
                </p>
            </div>
        </div>
    );
}