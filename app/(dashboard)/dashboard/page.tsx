'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Wrench, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { getClients } from '@/lib/data/storage';
import { getServices } from '@/lib/data/storage';
import { Service } from '@/types/service.types';

interface DashboardStats {
    totalClients: number;
    totalServices: number;
    pendingServices: number;
    inProgressServices: number;
    completedServices: number;
    deliveredServices: number;
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats>({
        totalClients: 0,
        totalServices: 0,
        pendingServices: 0,
        inProgressServices: 0,
        completedServices: 0,
        deliveredServices: 0,
    });
    const [recentServices, setRecentServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = () => {
            const clients = getClients();
            const services = getServices();

            setStats({
                totalClients: clients.length,
                totalServices: services.length,
                pendingServices: services.filter(s => s.status === 'pending').length,
                inProgressServices: services.filter(s => s.status === 'in-progress').length,
                completedServices: services.filter(s => s.status === 'completed').length,
                deliveredServices: services.filter(s => s.status === 'delivered').length,
            });

            // Últimos 5 servicios
            const sorted = [...services].sort(
                (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
            setRecentServices(sorted.slice(0, 5));
            setIsLoading(false);
        };

        loadData();

        // Escuchar cambios en localStorage
        const handleStorageChange = () => {
            loadData();
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const getStatusColor = (status: Service['status']) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            'in-progress': 'bg-blue-100 text-blue-800',
            completed: 'bg-green-100 text-green-800',
            delivered: 'bg-purple-100 text-purple-800',
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Cargando datos...</div>;
    }

    const cards = [
        {
            title: 'Clientes',
            value: stats.totalClients,
            icon: Users,
            color: 'bg-blue-500',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Servicios Totales',
            value: stats.totalServices,
            icon: Wrench,
            color: 'bg-indigo-500',
            bgColor: 'bg-indigo-50',
        },
        {
            title: 'Pendientes',
            value: stats.pendingServices,
            icon: Clock,
            color: 'bg-yellow-500',
            bgColor: 'bg-yellow-50',
        },
        {
            title: 'Completados',
            value: stats.completedServices + stats.deliveredServices,
            icon: CheckCircle,
            color: 'bg-green-500',
            bgColor: 'bg-green-50',
        },
    ];

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <Card key={index} className="border-none shadow-sm">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-gray-600">{card.title}</p>
                                    <p className="text-2xl font-bold text-gray-900 mt-1">{card.value}</p>
                                </div>
                                <div className={`p-3 rounded-full ${card.bgColor}`}>
                                    <card.icon className={`h-6 w-6 ${card.color}`} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Estado de Servicios</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Pendientes</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-yellow-500 rounded-full"
                                            style={{
                                                width: stats.totalServices > 0
                                                    ? `${(stats.pendingServices / stats.totalServices) * 100}%`
                                                    : '0%',
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{stats.pendingServices}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">En Proceso</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{
                                                width: stats.totalServices > 0
                                                    ? `${(stats.inProgressServices / stats.totalServices) * 100}%`
                                                    : '0%',
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{stats.inProgressServices}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Completados</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{
                                                width: stats.totalServices > 0
                                                    ? `${(stats.completedServices / stats.totalServices) * 100}%`
                                                    : '0%',
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{stats.completedServices}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Entregados</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-purple-500 rounded-full"
                                            style={{
                                                width: stats.totalServices > 0
                                                    ? `${(stats.deliveredServices / stats.totalServices) * 100}%`
                                                    : '0%',
                                            }}
                                        />
                                    </div>
                                    <span className="text-sm font-medium">{stats.deliveredServices}</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Servicios Recientes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {recentServices.length === 0 ? (
                            <p className="text-sm text-gray-500">No hay servicios registrados</p>
                        ) : (
                            <div className="space-y-3">
                                {recentServices.map((service) => (
                                    <div key={service.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {service.clientName}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {service.computer.brand} {service.computer.model}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-400">
                                                {formatDate(service.entryDate)}
                                            </span>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(service.status)}`}>
                                                {getStatusLabel(service.status)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}