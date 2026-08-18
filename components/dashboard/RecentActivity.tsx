'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Service } from '@/types/service.types';
import { Wrench, User, CheckCircle, Clock } from 'lucide-react';

interface RecentActivityProps {
    services: Service[];
    className?: string;
}

export function RecentActivity({ services, className }: RecentActivityProps) {
    const getStatusIcon = (status: Service['status']) => {
        const icons = {
            pending: Clock,
            'in-progress': Wrench,
            completed: CheckCircle,
            delivered: CheckCircle,
        };
        const Icon = icons[status] || Clock;
        return <Icon className="h-4 w-4" />;
    };

    const getStatusColor = (status: Service['status']) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'in-progress': 'bg-blue-100 text-blue-800 border-blue-200',
            completed: 'bg-green-100 text-green-800 border-green-200',
            delivered: 'bg-purple-100 text-purple-800 border-purple-200',
        };
        return colors[status] || colors.pending;
    };

    const getStatusLabel = (status: Service['status']) => {
        const labels = {
            pending: 'Pendiente',
            'in-progress': 'En Proceso',
            completed: 'Completado',
            delivered: 'Entregado',
        };
        return labels[status] || status;
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));

        if (hours < 1) {
            return 'Hace unos minutos';
        } else if (hours < 24) {
            return `Hace ${hours} horas`;
        } else {
            return date.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short',
                hour: '2-digit',
                minute: '2-digit',
            });
        }
    };

    const sortedServices = [...services]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 6);

    return (
        <Card className={cn('border-none shadow-sm', className)}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {sortedServices.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-8">
                            No hay actividad reciente
                        </p>
                    ) : (
                        sortedServices.map((service) => (
                            <div
                                key={service.id}
                                className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <Avatar className="h-10 w-10 bg-blue-100">
                                    <AvatarFallback className="text-blue-600 font-medium">
                                        {getInitials(service.clientName)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {service.clientName}
                                        </p>
                                        <Badge className={getStatusColor(service.status)}>
                                            <span className="flex items-center gap-1">
                                                {getStatusIcon(service.status)}
                                                {getStatusLabel(service.status)}
                                            </span>
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-gray-500 truncate">
                                        {service.computer.brand} {service.computer.model}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-xs text-gray-400">
                                            {service.ticketNumber}
                                        </span>
                                        <span className="text-xs text-gray-300">•</span>
                                        <span className="text-xs text-gray-400">
                                            {formatTime(service.createdAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}