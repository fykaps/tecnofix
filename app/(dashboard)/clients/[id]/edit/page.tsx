'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { ClientForm } from '@/components/clients/ClientForm';
import { getClient } from '@/lib/data/storage';
import { Client, ClientFormData } from '@/types/client.types';
import { toast } from '@/components/ui/toast';

export default function EditClientPage() {
    const params = useParams();
    const router = useRouter();
    const [client, setClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        const data = getClient(id);
        if (data) {
            setClient(data);
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

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Cargando cliente...</div>;
    }

    if (!client) {
        return <div className="flex items-center justify-center h-64">Cliente no encontrado</div>;
    }

    // Convertir Client a ClientFormData
    const formData: ClientFormData = {
        name: client.name,
        phone: client.phone,
        email: client.email || '',
        address: client.address || '',
        documentType: client.documentType,
        documentNumber: client.documentNumber,
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/clients')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Editar Cliente</h2>
                    <p className="text-gray-500">Actualiza los datos del cliente</p>
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Datos del Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    <ClientForm mode="edit" clientId={client.id} initialData={formData} />
                </CardContent>
            </Card>
        </div>
    );
}