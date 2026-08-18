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
import {
    getClients,
    saveService,
    generateId,
    generateTicketNumber,
    getService,
} from '@/lib/data/storage';
import { CostBreakdown, Service } from '@/types/service.types';
import { CostCalculator } from './CostCalculator';
import { Search, UserPlus, CheckCircle, AlertCircle, Save, History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { cn } from '@/lib/utils';

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
    const [costBreakdown, setCostBreakdown] = useState<CostBreakdown>({
        labor: 0,
        parts: 0,
        materials: 0,
        travel: 0,
        total: 0,
    });
    const [customerApproved, setCustomerApproved] = useState(false);
    const [originalService, setOriginalService] = useState<Service | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            cost: 0,
            costBreakdown: {
                labor: 0,
                parts: 0,
                materials: 0,
            },
        },
    });

    const issueValue = form.watch('issue');

    useEffect(() => {
        const allClients = getClients();
        setClients(allClients);

        // ✅ Si es modo edición, cargar todos los datos del servicio
        if (mode === 'edit' && serviceId) {
            const service = getService(serviceId);
            if (service) {
                setOriginalService(service);

                // ✅ Cargar el costBreakdown existente
                if (service.costBreakdown) {
                    setCostBreakdown({
                        labor: service.costBreakdown.labor || 0,
                        parts: service.costBreakdown.parts || 0,
                        materials: service.costBreakdown.materials || 0,
                        travel: service.costBreakdown.travel || 0,
                        total: service.costBreakdown.total || service.cost || 0,
                    });
                }

                // ✅ Cargar la aprobación del cliente
                if (service.customerApproved) {
                    setCustomerApproved(true);
                }

                // ✅ Cargar el cliente seleccionado
                const client = allClients.find(c => c.id === service.clientId);
                if (client) {
                    setSelectedClient(client);
                    form.setValue('clientName', client.name);
                }
            }
        }

        if (initialData?.clientId) {
            const client = allClients.find(c => c.id === initialData.clientId);
            if (client) {
                setSelectedClient(client);
                form.setValue('clientName', client.name);
            }
        }
    }, [initialData, form, mode, serviceId]);

    // ✅ Actualizar costo total en el formulario
    useEffect(() => {
        form.setValue('cost', costBreakdown.total);
    }, [costBreakdown, form]);

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
            type: 'success'
        });
    };

    const handleCostChange = (breakdown: CostBreakdown) => {
        setCostBreakdown(breakdown);
        if (customerApproved && originalService) {
            if (breakdown.total !== originalService.costBreakdown.total) {
                toast.add({
                    title: 'Costo modificado',
                    description: 'El costo ha cambiado. El cliente deberá aprobar el nuevo presupuesto.',
                    type: 'success'
                });
            }
        }
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

    const onSubmit = async (data: ServiceFormValues) => {
        if (!customerApproved) {
            toast.add({
                title: 'Presupuesto no aprobado',
                description: 'El cliente debe aprobar el presupuesto antes de crear o actualizar el servicio',
                type: 'error'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const now = new Date().toISOString();

            if (mode === 'create') {
                const newService: Service = {
                    ...data,
                    id: generateId('srvc'),
                    status: 'pending',
                    entryDate: now,
                    createdAt: now,
                    updatedAt: now,
                    ticketNumber: generateTicketNumber(),
                    clientId: data.clientId,
                    deliveredDate: undefined,
                    diagnosis: '',
                    repairDetails: '',
                    costBreakdown: costBreakdown,
                    cost: costBreakdown.total,
                    estimatedCost: costBreakdown.total,
                    customerApproved: true,
                    approvalDate: now,
                    statusHistory: [
                        {
                            status: 'pending',
                            date: now,
                            note: 'Servicio creado con presupuesto aprobado',
                        },
                    ],
                };
                saveService(newService);
                toast.add({
                    title: 'Servicio creado',
                    description: `Ticket ${newService.ticketNumber} creado exitosamente`,
                    type: 'success'
                });
            } else if (mode === 'edit' && serviceId) {
                const existingService = getService(serviceId);
                if (!existingService) {
                    toast.add({
                        title: 'Error',
                        description: 'Servicio no encontrado',
                        type: 'error'
                    });
                    return;
                }

                if (existingService.status === 'completed' || existingService.status === 'delivered') {
                    toast.add({
                        title: 'Error',
                        description: 'No se puede editar un servicio completado o entregado',
                        type: 'error'
                    });
                    return;
                }

                const historyNotes = [];
                if (existingService.costBreakdown.total !== costBreakdown.total) {
                    historyNotes.push(
                        `Costo actualizado: ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(existingService.costBreakdown.total)} → ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(costBreakdown.total)}`
                    );
                }
                if (existingService.technician !== data.technician) {
                    historyNotes.push(`Técnico: ${existingService.technician} → ${data.technician}`);
                }
                if (existingService.estimatedDelivery !== data.estimatedDelivery) {
                    historyNotes.push(`Entrega estimada: ${existingService.estimatedDelivery} → ${data.estimatedDelivery}`);
                }

                const updatedService: Service = {
                    ...existingService,
                    ...data,
                    computer: data.computer,
                    issue: data.issue,
                    estimatedDelivery: data.estimatedDelivery,
                    technician: data.technician,
                    costBreakdown: costBreakdown,
                    cost: costBreakdown.total,
                    customerApproved: true,
                    approvalDate: now,
                    updatedAt: now,
                    statusHistory: [
                        ...existingService.statusHistory,
                        {
                            status: existingService.status,
                            date: now,
                            note: historyNotes.length > 0
                                ? `Edición: ${historyNotes.join('; ')}`
                                : 'Edición general del servicio',
                        },
                    ],
                };
                saveService(updatedService);
                toast.add({
                    title: 'Servicio actualizado',
                    description: `Ticket ${updatedService.ticketNumber} actualizado exitosamente`,
                    type: 'success'
                });
            }

            router.push('/services');
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'No se pudo guardar el servicio',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const isBlocked = mode === 'edit' && originalService &&
        (originalService.status === 'completed' || originalService.status === 'delivered');

    if (isBlocked) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Servicio bloqueado</AlertTitle>
                <AlertDescription>
                    Este servicio está en estado <strong>{getStatusLabel(originalService.status)}</strong> y no puede ser editado.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* ✅ Historial - SIN prop collapsible */}
                {mode === 'edit' && originalService && originalService.statusHistory && (
                    <Accordion type="single" className="border rounded-lg">
                        <AccordionItem value="history">
                            <AccordionTrigger className="px-4 hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <History className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium">Historial de cambios</span>
                                    <Badge variant="outline" className="ml-2">
                                        {originalService.statusHistory.length} cambios
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                                <div className="space-y-2">
                                    {originalService.statusHistory.map((entry, index) => (
                                        <div key={index} className="text-sm border-l-2 border-gray-200 pl-3 py-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusColor(entry.status)}>
                                                    {getStatusLabel(entry.status)}
                                                </Badge>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(entry.date).toLocaleString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                            {entry.note && (
                                                <p className="text-gray-600 mt-1">{entry.note}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}

                {/* Resto del formulario - Sección Cliente, Equipo, Servicio, Costos... */}
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

                    {/* Sección Equipo */}
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
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

                    {/* ✅ Calculadora de Costos - con valores iniciales */}
                    <div className="space-y-4">
                        <CostCalculator
                            onCostChange={handleCostChange}
                            initialCost={costBreakdown}
                            issueDescription={issueValue}
                        />

                        {/* Aprobación del Cliente */}
                        <Card className={cn(
                            "border shadow-sm",
                            customerApproved ? "border-green-200 bg-green-50/50" : "border-yellow-200 bg-yellow-50/50"
                        )}>
                            <CardContent className="pt-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <input
                                            type="checkbox"
                                            id="customerApproved"
                                            checked={customerApproved}
                                            onChange={(e) => setCustomerApproved(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="customerApproved" className="font-medium cursor-pointer">
                                            {customerApproved ? '✅ Cliente aprueba el presupuesto' : 'Cliente aprueba el presupuesto'}
                                        </label>
                                        <p className="text-sm text-gray-500">
                                            Confirmar que el cliente ha aceptado el presupuesto detallado.
                                        </p>
                                        {costBreakdown.total > 0 && customerApproved && (
                                            <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Presupuesto aprobado por {new Intl.NumberFormat('es-PE', {
                                                    style: 'currency',
                                                    currency: 'PEN',
                                                }).format(costBreakdown.total)}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Botones de acción */}
                <div className="flex justify-end gap-4 pt-4 border-t">
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
                        disabled={!customerApproved || costBreakdown.total === 0 || isSubmitting}
                    >
                        {isSubmitting ? (
                            <>Guardando...</>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {mode === 'create' ? 'Crear Servicio' : 'Actualizar Servicio'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

// Función auxiliar para colores de estado
function getStatusColor(status: Service['status']) {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        delivered: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || colors.pending;
}