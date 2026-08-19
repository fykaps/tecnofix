'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    ArrowLeft,
    User,
    Phone,
    Mail,
    MapPin,
    FileText,
    Calendar,
    Wrench,
    DollarSign,
    Clock,
    CheckCircle,
    AlertCircle,
    Package,
    Laptop,
    Users,
} from 'lucide-react';
import { getClient, getServices } from '@/lib/data/storage';
import { Client } from '@/types/client.types';
import { Service } from '@/types/service.types';
import { toast } from '@/components/ui/toast';

export default function ClientDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [stats, setStats] = useState({
        totalServices: 0,
        completedServices: 0,
        pendingServices: 0,
        totalSpent: 0,
        averageTicket: 0,
        lastService: '',
    });

    useEffect(() => {
        const id = params.id as string;
        const clientData = getClient(id);
        if (clientData) {
            setClient(clientData);
            const allServices = getServices();
            const clientServices = allServices.filter(s => s.clientId === id);
            setServices(clientServices);

            // Calcular estadísticas
            const completed = clientServices.filter(s => s.status === 'delivered' || s.status === 'completed');
            const pending = clientServices.filter(s => s.status === 'pending' || s.status === 'in-progress');
            const totalSpent = completed.reduce((sum, s) => sum + (s.cost || 0), 0);
            const avgTicket = completed.length > 0 ? totalSpent / completed.length : 0;
            const lastService = clientServices.length > 0
                ? new Date(Math.max(...clientServices.map(s => new Date(s.entryDate).getTime()))).toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                })
                : 'Ninguno';

            setStats({
                totalServices: clientServices.length,
                completedServices: completed.length,
                pendingServices: pending.length,
                totalSpent,
                averageTicket: avgTicket,
                lastService,
            });
        } else {
            toast.add({
                title: 'Error',
                description: 'Cliente no encontrado',
                type: 'error',
            });
            router.push('/clients');
        }
        setIsLoading(false);
    }, [params.id, router]);

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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
        }).format(value);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Cargando información del cliente...</p>
                </div>
            </div>
        );
    }

    if (!client) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Cliente no encontrado</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push('/clients')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <User className="h-6 w-6 text-blue-600" />
                            {client.name}
                        </h2>
                        <p className="text-gray-500">
                            Cliente desde {formatDate(client.createdAt)}
                        </p>
                    </div>
                </div>
                <Button
                    onClick={() => router.push(`/services/new?clientId=${client.id}`)}
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    <Wrench className="h-4 w-4 mr-2" />
                    Nuevo Servicio
                </Button>
            </div>

            {/* Información del Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-blue-50 p-2 rounded-full">
                            <Phone className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Teléfono</p>
                            <p className="font-medium">{client.phone}</p>
                        </div>
                    </CardContent>
                </Card>
                {client.email && (
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="bg-purple-50 p-2 rounded-full">
                                <Mail className="h-5 w-5 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="font-medium truncate">{client.email}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                {client.address && (
                    <Card className="border-none shadow-sm">
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className="bg-green-50 p-2 rounded-full">
                                <MapPin className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Dirección</p>
                                <p className="font-medium truncate">{client.address}</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex items-center gap-3">
                        <div className="bg-orange-50 p-2 rounded-full">
                            <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Documento</p>
                            <p className="font-medium">{client.documentType}: {client.documentNumber}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Estadísticas del Cliente */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-white">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Servicios</p>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalServices}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gradient-to-br from-green-50 to-white">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Completados</p>
                        <p className="text-2xl font-bold text-green-600">{stats.completedServices}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gradient-to-br from-yellow-50 to-white">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Pendientes</p>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pendingServices}</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-white">
                    <CardContent className="p-4">
                        <p className="text-sm text-gray-500">Total Gastado</p>
                        <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.totalSpent)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tarjeta de resumen adicional */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Ticket Promedio</p>
                            <p className="text-lg font-bold text-gray-900">{formatCurrency(stats.averageTicket)}</p>
                        </div>
                        <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">Último Servicio</p>
                            <p className="text-lg font-bold text-gray-900">{stats.lastService}</p>
                        </div>
                        <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
                    </CardContent>
                </Card>
            </div>

            {/* Historial de Servicios */}
            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                        <Wrench className="h-5 w-5 text-blue-600" />
                        Historial de Servicios
                        <Badge variant="secondary" className="ml-2">
                            {services.length} servicios
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {services.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <Package className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <p>Este cliente aún no tiene servicios registrados</p>
                            <Button
                                variant="outline"
                                className="mt-2"
                                onClick={() => router.push(`/services/new?clientId=${client.id}`)}
                            >
                                Registrar primer servicio
                            </Button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50">
                                        <TableHead>Ticket</TableHead>
                                        <TableHead>Equipo</TableHead>
                                        <TableHead>Problema</TableHead>
                                        <TableHead>Fecha Ingreso</TableHead>
                                        <TableHead>Costo</TableHead>
                                        <TableHead>Estado</TableHead>
                                        <TableHead className="text-right">Acciones</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {services.map((service) => (
                                        <TableRow key={service.id} className="hover:bg-gray-50">
                                            <TableCell className="font-mono font-medium text-sm">
                                                {service.ticketNumber}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {service.computer.brand} {service.computer.model}
                                                </span>
                                                <span className="text-xs text-gray-500 block">
                                                    {service.computer.type}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm line-clamp-2 max-w-[200px]">
                                                    {service.issue}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                {formatDate(service.entryDate)}
                                            </TableCell>
                                            <TableCell>
                                                <span className="font-medium text-blue-600">
                                                    {formatCurrency(service.cost || 0)}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(service.status)}>
                                                    <span className="flex items-center gap-1">
                                                        {getStatusIcon(service.status)}
                                                        {getStatusLabel(service.status)}
                                                    </span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => router.push(`/services/${service.id}`)}
                                                >
                                                    Ver Detalles
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Resumen rápido */}
            {services.length > 0 && (
                <Card className="border-none shadow-sm bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardContent className="p-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-blue-600" />
                                <span className="text-sm font-medium">Resumen del Cliente</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <span className="text-gray-600">
                                    <span className="font-medium">{services.length}</span> servicios totales
                                </span>
                                <span className="text-gray-600">
                                    <span className="font-medium text-green-600">{stats.completedServices}</span> completados
                                </span>
                                <span className="text-gray-600">
                                    <span className="font-medium text-yellow-600">{stats.pendingServices}</span> pendientes
                                </span>
                                <span className="text-gray-600">
                                    Total: <span className="font-medium text-purple-600">{formatCurrency(stats.totalSpent)}</span>
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}