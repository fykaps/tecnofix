"use client";

import { useEffect, useState } from "react";
import { ClientTable } from "@/components/clients/ClientTable";
import { getClients } from "@/lib/data/storage";
import { Client } from "@/types/client.types";

export default function ClientsPage() {
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadClients = () => {
        const data = getClients();
        setClients(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadClients();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Cargando clientes...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 lg:px-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Clientes</h2>
                    <p className="text-gray-500">Gestiona todos tus clientes registrados</p>
                </div>
            </div>
            <ClientTable clients={clients} onClientDeleted={loadClients} />
        </div>
    );
}