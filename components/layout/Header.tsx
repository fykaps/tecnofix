'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Clock } from 'lucide-react';

interface HeaderProps {
    sessionTimeRemaining?: number | null;
}

export function Header({ sessionTimeRemaining }: HeaderProps) {
    const { user } = useAuth();

    const getInitials = (name: string) => {
        return name.charAt(0).toUpperCase();
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
            <div>
                <h1 className="text-lg font-semibold text-gray-800">Panel de Control</h1>
                <p className="text-sm text-gray-500">Gestiona tus servicios y clientes</p>
            </div>
            <div className="flex items-center gap-4">
                {sessionTimeRemaining !== null && sessionTimeRemaining > 0 && (
                    <Badge variant="outline" className="flex items-center gap-1 bg-blue-50 text-blue-600 border-blue-200">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono text-xs">
                            {formatTime(sessionTimeRemaining)}
                        </span>
                    </Badge>
                )}
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    TECNOFIX v1.0
                </Badge>
                <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 bg-blue-100">
                        <AvatarFallback className="text-blue-600 font-medium">
                            {user ? getInitials(user) : 'U'}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700">{user || 'Usuario'}</span>
                </div>
            </div>
        </header>
    );
}