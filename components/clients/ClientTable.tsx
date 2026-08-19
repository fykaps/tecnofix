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
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Pencil, Trash2, Eye, Search, Wrench } from 'lucide-react';
import { Client } from '@/types/client.types';
import { deleteClient, getClients, getServices } from '@/lib/data/storage';
import { toast } from '@/components/ui/toast';

interface ClientTableProps {
    clients: Client[];
    onClientDeleted?: () => void;
}

export function ClientTable({ clients: initialClients, onClientDeleted }: ClientTableProps) {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>(initialClients);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [hasServices, setHasServices] = useState<Record<string, boolean>>({});

    useEffect(() => {
        setClients(initialClients);
        // Verificar servicios para cada cliente
        const servicesMap: Record<string, boolean> = {};
        const allServices = getServices();
        initialClients.forEach(client => {
            servicesMap[client.id] = allServices.some(s => s.clientId === client.id);
        });
        setHasServices(servicesMap);
    }, [initialClients]);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.documentNumber.includes(searchTerm)
    );

    const handleDelete = async () => {
        if (!selectedClient) return;

        // ✅ Verificar si el cliente tiene servicios
        if (hasServices[selectedClient.id]) {
            toast.add({
                title: 'No se puede eliminar',
                description: `El cliente ${selectedClient.name} tiene servicios asociados. No se puede eliminar.`,
                type: 'error',
            });
            setShowDeleteDialog(false);
            setSelectedClient(null);
            return;
        }

        setIsDeleting(true);
        try {
            deleteClient(selectedClient.id);
            setClients(prev => prev.filter(c => c.id !== selectedClient.id));
            toast.add({
                title: 'Cliente eliminado',
                description: `${selectedClient.name} fue eliminado correctamente`,
                type: 'success'
            });
            if (onClientDeleted) onClientDeleted();
            setShowDeleteDialog(false);
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'No se pudo eliminar el cliente',
                type: 'error'
            });
        } finally {
            setIsDeleting(false);
            setSelectedClient(null);
        }
    };

    const getDocumentLabel = (type: string) => {
        const labels: Record<string, string> = {
            DNI: 'DNI',
            CE: 'C.E.',
            RUC: 'RUC',
        };
        return labels[type] || type;
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <Button onClick={() => router.push('/clients/new')} className="bg-blue-600 hover:bg-blue-700">
                    Nuevo Cliente
                </Button>
            </div>

            <div className="rounded-md border border-gray-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead>Nombre</TableHead>
                            <TableHead>Teléfono</TableHead>
                            <TableHead>Documento</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredClients.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                    {searchTerm ? 'No se encontraron resultados' : 'No hay clientes registrados'}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredClients.map((client) => {
                                const clientHasServices = hasServices[client.id] || false;
                                return (
                                    <TableRow key={client.id} className="hover:bg-gray-50">
                                        <TableCell className="font-medium">{client.name}</TableCell>
                                        <TableCell>{client.phone}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-gray-100">
                                                {getDocumentLabel(client.documentType)}: {client.documentNumber}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-gray-500">{client.email || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
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

                                                    {/* ✅ Ver Detalles */}
                                                    <DropdownMenuItem onClick={() => router.push(`/clients/${client.id}`)}>
                                                        <Eye className="h-4 w-4 mr-2" />
                                                        Ver detalles
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={() => router.push(`/clients/${client.id}/edit`)}>
                                                        <Pencil className="h-4 w-4 mr-2" />
                                                        Editar
                                                    </DropdownMenuItem>

                                                    <DropdownMenuItem onClick={() => router.push(`/services/new?clientId=${client.id}`)}>
                                                        <Wrench className="h-4 w-4 mr-2" />
                                                        Nuevo Servicio
                                                    </DropdownMenuItem>

                                                    <DropdownMenuSeparator />

                                                    {/* ✅ Eliminar - deshabilitado si tiene servicios */}
                                                    {clientHasServices ? (
                                                        <DropdownMenuItem disabled className="opacity-50 cursor-not-allowed text-gray-400">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Eliminar (tiene servicios)
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            className="text-red-600 focus:text-red-600"
                                                            onClick={() => {
                                                                setSelectedClient(client);
                                                                setShowDeleteDialog(true);
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Eliminar
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta acción eliminará permanentemente al cliente{' '}
                            <strong>{selectedClient?.name}</strong> y todos sus datos asociados.
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
                            {isDeleting ? 'Eliminando...' : 'Eliminar Cliente'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}