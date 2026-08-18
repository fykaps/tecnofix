'use client';

import { useEffect, useState } from 'react';
import { ClientTable } from '@/components/clients/ClientTable';
import { getClients } from '@/lib/data/storage';
import { Client } from '@/types/client.types';

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadClients = () => {
        const data = getClients();
        setClients(data);
    };

    useEffect(() => {
        loadClients();
        setIsLoading(false);
    }, []);

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Cargando clientes...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
                <p className="text-gray-500">Gestiona todos tus clientes registrados</p>
            </div>
            <ClientTable clients={clients} onClientDeleted={loadClients} />
        </div>
    );
}