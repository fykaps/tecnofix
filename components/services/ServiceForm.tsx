'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { serviceSchema, ServiceFormValues } from '@/lib/validations/service.schema';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { Client } from '@/types/client.types';
import { getClients, saveService, generateId, generateTicketNumber } from '@/lib/data/storage';
import { ComputerSpecs } from '@/types/service.types';
import { Search, UserPlus } from 'lucide-react';

interface ServiceFormProps {
    initialData?: ServiceFormValues;
    serviceId?: string;
    mode?: 'create' | 'edit';
}

export function ServiceForm({ initialData, serviceId, mode = 'create' }: ServiceFormProps) {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showClientSearch, setShowClientSearch] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: initialData || {
            clientId: '',
            clientName: '',
            computer: {
                brand: '',
                model: '',
                type: 'Desktop',
                processor: '',
                ram: '',
                storage: '',
                graphics: '',
                operatingSystem: '',
                observations: '',
            },
            issue: '',
            estimatedDelivery: '',
            technician: '',
        },
    });

    useEffect(() => {
        const allClients = getClients();
        setClients(allClients);

        // Si hay clientId en initialData, buscar el cliente
        if (initialData?.clientId) {
            const client = allClients.find(c => c.id === initialData.clientId);
            if (client) {
                setSelectedClient(client);
                form.setValue('clientName', client.name);
            }
        }
    }, [initialData, form]);

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.phone.includes(searchTerm) ||
        client.documentNumber.includes(searchTerm)
    );

    const handleSelectClient = (client: Client) => {
        setSelectedClient(client);
        form.setValue('clientId', client.id);
        form.setValue('clientName', client.name);
        setShowClientSearch(false);
        setSearchTerm('');
        toast.add({
            title: 'Cliente seleccionado',
            description: `${client.name} ha sido seleccionado`,
        });
    };

    const onSubmit = async (data: ServiceFormValues) => {
        try {
            const now = new Date().toISOString();

            if (mode === 'create') {
                const newService = {
                    ...data,
                    id: generateId('srvc'),
                    status: 'pending' as const,
                    entryDate: now,
                    createdAt: now,
                    updatedAt: now,
                    ticketNumber: generateTicketNumber(),
                    clientId: data.clientId,
                    deliveredDate: undefined,
                    diagnosis: '',
                    repairDetails: '',
                    cost: undefined,
                };
                saveService(newService);
                toast.add({
                    title: 'Servicio creado',
                    description: `Ticket ${newService.ticketNumber} creado exitosamente`,
                });
            } else if (serviceId) {
                // Editar servicio existente
                const existingService = getServices().find(s => s.id === serviceId);
                if (existingService) {
                    const updatedService = {
                        ...existingService,
                        ...data,
                        updatedAt: now,
                    };
                    saveService(updatedService);
                    toast.add({
                        title: 'Servicio actualizado',
                        description: `Ticket ${updatedService.ticketNumber} actualizado`,
                    });
                }
            }

            router.push('/services');
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'No se pudo guardar el servicio',
                variant: 'destructive',
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Sección Cliente */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Información del Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Buscar Cliente</FormLabel>
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                    onClick={() => setShowClientSearch(!showClientSearch)}
                                                >
                                                    <Search className="h-4 w-4 mr-2 text-gray-500" />
                                                    {selectedClient ? selectedClient.name : 'Buscar cliente...'}
                                                </Button>
                                                {showClientSearch && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                        <div className="p-2">
                                                            <Input
                                                                placeholder="Escribe nombre, teléfono o documento..."
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                className="mb-2"
                                                                autoFocus
                                                            />
                                                            {filteredClients.length === 0 ? (
                                                                <p className="text-sm text-gray-500 p-2 text-center">
                                                                    No se encontraron clientes
                                                                </p>
                                                            ) : (
                                                                filteredClients.map((client) => (
                                                                    <button
                                                                        key={client.id}
                                                                        type="button"
                                                                        className="w-full text-left p-2 hover:bg-gray-100 rounded-md transition-colors"
                                                                        onClick={() => handleSelectClient(client)}
                                                                    >
                                                                        <p className="font-medium">{client.name}</p>
                                                                        <p className="text-sm text-gray-500">
                                                                            {client.phone} • {client.documentType}: {client.documentNumber}
                                                                        </p>
                                                                    </button>
                                                                ))
                                                            )}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                className="w-full mt-2 text-blue-600"
                                                                onClick={() => router.push('/clients/new')}
                                                            >
                                                                <UserPlus className="h-4 w-4 mr-2" />
                                                                Crear nuevo cliente
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="clientName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del Cliente</FormLabel>
                                        <FormControl>
                                            <Input {...field} readOnly className="bg-gray-50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* Sección Información del Equipo */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">Información del Equipo</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="computer.brand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marca</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="HP, Dell, Lenovo..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="computer.model"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Modelo</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Pavilion 15, OptiPlex..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="computer.type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Equipo</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Desktop">Desktop</SelectItem>
                                                <SelectItem value="Laptop">Laptop</SelectItem>
                                                <SelectItem value="All-in-One">All-in-One</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="computer.processor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Procesador</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Intel i5, Ryzen 7..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="computer.ram"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>RAM</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="8GB, 16GB..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="computer.storage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Almacenamiento</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="256GB SSD, 1TB HDD..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="computer.graphics"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gráficos (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="NVIDIA GTX, Intel Iris..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="computer.operatingSystem"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sistema Operativo</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Windows 11, macOS Ventura..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="computer.observations"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observaciones del Equipo</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Estado físico, detalles adicionales..."
                                                rows={2}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Sección del Servicio */}
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Detalles del Servicio</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <FormField
                            control={form.control}
                            name="issue"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descripción del Problema</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder="Describe detalladamente el problema que presenta el equipo..."
                                            rows={4}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="technician"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Técnico Responsable</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Nombre del técnico..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="estimatedDelivery"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Fecha Estimada de Entrega</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="date" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/services')}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        {mode === 'create' ? 'Crear Servicio' : 'Actualizar Servicio'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}