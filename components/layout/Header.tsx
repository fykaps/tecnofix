'use client';

import { Clock, Bell } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { SearchDialog } from './SearchDialog';

interface HeaderProps {
    sessionTimeRemaining?: number | null;
}

export function Header({ sessionTimeRemaining }: HeaderProps) {
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    return (
        <header className="flex h-12 shrink-0 items-center gap-1 border-b px-3">
            {/* ✅ SidebarTrigger alineado correctamente */}
            <SidebarTrigger className="h-8 w-8 flex-shrink-0" />
            <Separator orientation="vertical" className="h-5 mx-0.5" />
            <SearchDialog />
            <div className="ml-auto flex items-center gap-1">
                {sessionTimeRemaining !== null && sessionTimeRemaining > 0 && (
                    <Badge variant="outline" className="hidden sm:flex items-center gap-1 bg-blue-50 text-blue-600 border-blue-200 text-xs px-2 py-0 h-6">
                        <Clock className="h-3 w-3" />
                        <span className="font-mono text-xs">
                            {formatTime(sessionTimeRemaining)}
                        </span>
                    </Badge>
                )}
                <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                </Button>
            </div>
        </header>
    );
}