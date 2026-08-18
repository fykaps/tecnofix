'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientSchema, ClientFormValues } from '@/lib/validations/client.schema';
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
import { toast } from '@/components/ui/toast';
import { saveClient, generateId } from '@/lib/data/storage';
import { Client } from '@/types/client.types';

interface ClientFormProps {
    initialData?: ClientFormValues;
    clientId?: string;
    mode?: 'create' | 'edit';
}

export function ClientForm({ initialData, clientId, mode = 'create' }: ClientFormProps) {
    const router = useRouter();

    const form = useForm<ClientFormValues>({
        resolver: zodResolver(clientSchema),
        defaultValues: initialData || {
            name: '',
            phone: '',
            email: '',
            address: '',
            documentType: 'DNI',
            documentNumber: '',
        },
    });

    const onSubmit = async (data: ClientFormValues) => {
        try {
            const now = new Date().toISOString();

            if (mode === 'create') {
                const newClient: Client = {
                    ...data,
                    id: generateId('cli'),
                    createdAt: now,
                    updatedAt: now,
                };
                saveClient(newClient);
                toast.add({
                    title: 'Cliente creado',
                    description: `${data.name} ha sido registrado exitosamente`,
                });
            } else if (clientId) {
                // Actualizar cliente existente
                const existingClient = getClient(clientId);
                if (existingClient) {
                    const updatedClient: Client = {
                        ...existingClient,
                        ...data,
                        updatedAt: now,
                    };
                    saveClient(updatedClient);
                    toast.add({
                        title: 'Cliente actualizado',
                        description: `${data.name} ha sido actualizado exitosamente`,
                    });
                }
            }

            router.push('/clients');
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'No se pudo guardar el cliente',
                variant: 'destructive',
            });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Nombre Completo</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Juan Pérez" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Teléfono</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="987654321" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="cliente@email.com" type="email" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Dirección</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="Av. Principal 123" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="documentType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Tipo de Documento</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Selecciona tipo" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="DNI">DNI</SelectItem>
                                        <SelectItem value="CE">Carné de Extranjería</SelectItem>
                                        <SelectItem value="RUC">RUC</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="documentNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Número de Documento</FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="71234567" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex justify-end gap-4 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/clients')}
                    >
                        Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                        {mode === 'create' ? 'Crear Cliente' : 'Actualizar Cliente'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

// Función auxiliar para obtener cliente por ID (importada de storage)
import { getClient } from '@/lib/data/storage';