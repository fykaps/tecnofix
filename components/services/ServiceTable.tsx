'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Eye, Printer, Pencil, Trash2, Plus, Search } from 'lucide-react';
import { Service } from '@/types/service.types';
import { getServices, updateServiceStatus, deleteService } from '@/lib/data/storage';
import { toast } from '@/components/ui/toast';

interface ServiceTableProps {
    services: Service[];
    onServiceDeleted?: () => void;
}

export function ServiceTable({ services: initialServices, onServiceDeleted }: ServiceTableProps) {
    const router = useRouter();
    const [services, setServices] = useState<Service[]>(initialServices);
    const [filteredServices, setFilteredServices] = useState<Service[]>(initialServices);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        setServices(initialServices);
        applyFilters(initialServices, searchTerm, statusFilter);
    }, [initialServices]);

    const applyFilters = (data: Service[], term: string, status: string) => {
        let filtered = data;
        if (term) {
            filtered = filtered.filter(s =>
                s.clientName.toLowerCase().includes(term.toLowerCase()) ||
                s.ticketNumber.toLowerCase().includes(term.toLowerCase()) ||
                s.computer.brand.toLowerCase().includes(term.toLowerCase())
            );
        }
        if (status !== 'all') {
            filtered = filtered.filter(s => s.status === status);
        }
        setFilteredServices(filtered);
    };

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        applyFilters(services, term, statusFilter);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        applyFilters(services, searchTerm, status);
    };

    const handleStatusChange = (serviceId: string, newStatus: Service['status']) => {
        try {
            updateServiceStatus(serviceId, newStatus);
            const updated = getServices();
            setServices(updated);
            applyFilters(updated, searchTerm, statusFilter);
            toast.add({
                title: 'Estado actualizado',
                description: `El servicio ha sido actualizado a ${getStatusLabel(newStatus)}`,
                type: 'success',
            });
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'No se pudo actualizar el estado',
                type: 'error',
            });
        }
    };

    const handleDelete = () => {
        if (!selectedService) return;
        setIsDeleting(true);
        try {
            deleteService(selectedService.id);
            const updated = getServices();
            setServices(updated);
            applyFilters(updated, searchTerm, statusFilter);
            toast.add({
                title: 'Servicio eliminado',
                description: `Ticket ${selectedService.ticketNumber} eliminado`,
                type: 'success',
            });
            setShowDeleteDialog(false);
            if (onServiceDeleted) onServiceDeleted();
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'No se pudo eliminar el servicio',
                type: 'error',
            });
        } finally {
            setIsDeleting(false);
            setSelectedService(null);
        }
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-4">
            {/* Cabecera con filtros y botón nuevo */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por cliente, ticket, marca..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Select value={statusFilter} onValueChange={handleStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filtrar por estado" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Todos los estados</SelectItem>
                        <SelectItem value="pending">Pendiente</SelectItem>
                        <SelectItem value="in-progress">En Proceso</SelectItem>
                        <SelectItem value="completed">Completado</SelectItem>
                        <SelectItem value="delivered">Entregado</SelectItem>
                    </SelectContent>
                </Select>
                <Button onClick={() => router.push('/services/new')} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Servicio
                </Button>
            </div>

            {/* Tabla de servicios */}
            <div className="rounded-md border border-gray-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead>Ticket</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Equipo</TableHead>
                            <TableHead>Fecha Ingreso</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredServices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                                    {searchTerm || statusFilter !== 'all'
                                        ? 'No se encontraron resultados'
                                        : 'No hay servicios registrados'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredServices.map((service) => (
                                <TableRow key={service.id} className="hover:bg-gray-50">
                                    <TableCell className="font-mono font-medium text-sm">
                                        {service.ticketNumber}
                                    </TableCell>
                                    <TableCell className="font-medium">{service.clientName}</TableCell>
                                    <TableCell>
                                        <span className="text-sm">
                                            {service.computer.brand} {service.computer.model}
                                        </span>
                                        <span className="text-xs text-gray-500 block">
                                            {service.computer.type}
                                        </span>
                                    </TableCell>
                                    <TableCell>{formatDate(service.entryDate)}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(service.status)}>
                                            {getStatusLabel(service.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            {/* ✅ Usamos <button> nativo en el render - IGUAL QUE ClientTable */}
                                            <DropdownMenuTrigger
                                                render={
                                                    <button
                                                        type="button"
                                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-gray-100 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                                        aria-label="Abrir menú de acciones"
                                                    >
                                                        <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                                    </button>
                                                }
                                            />
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuGroup>
                                                    <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                                </DropdownMenuGroup>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem onClick={() => router.push(`/services/${service.id}`)}>
                                                    <Eye className="h-4 w-4 mr-2" />
                                                    Ver detalles
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/tickets/${service.id}`)}>
                                                    <Printer className="h-4 w-4 mr-2" />
                                                    Imprimir Ticket
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => router.push(`/services/${service.id}/edit`)}>
                                                    <Pencil className="h-4 w-4 mr-2" />
                                                    Editar
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuGroup>
                                                    <DropdownMenuLabel>Cambiar Estado</DropdownMenuLabel>
                                                </DropdownMenuGroup>
                                                {service.status !== 'pending' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(service.id, 'pending')}
                                                    >
                                                        Pendiente
                                                    </DropdownMenuItem>
                                                )}
                                                {service.status !== 'in-progress' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(service.id, 'in-progress')}
                                                    >
                                                        En Proceso
                                                    </DropdownMenuItem>
                                                )}
                                                {service.status !== 'completed' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(service.id, 'completed')}
                                                    >
                                                        Completado
                                                    </DropdownMenuItem>
                                                )}
                                                {service.status !== 'delivered' && (
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(service.id, 'delivered')}
                                                    >
                                                        Entregado
                                                    </DropdownMenuItem>
                                                )}
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600"
                                                    onClick={() => {
                                                        setSelectedService(service);
                                                        setShowDeleteDialog(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 mr-2" />
                                                    Eliminar
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Diálogo de confirmación para eliminar */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente el servicio{' '}
                            <strong>{selectedService?.ticketNumber}</strong> y todos sus datos.
                            Esta acción no se puede deshacer.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? 'Eliminando...' : 'Eliminar Servicio'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}