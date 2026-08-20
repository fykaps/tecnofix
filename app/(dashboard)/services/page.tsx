"use client";

import { useEffect, useState } from "react";
import { getServices } from "@/lib/data/storage";
import { Service } from "@/types/service.types";
import { ServiceTable } from "@/components/services/ServiceTable";

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const loadServices = () => {
        const data = getServices();
        setServices(data);
        setIsLoading(false);
    };

    useEffect(() => {
        loadServices();

        const handleStorageChange = () => {
            loadServices();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Cargando servicios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 lg:px-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Servicios</h2>
                    <p className="text-gray-500">Gestiona todos los servicios técnicos</p>
                </div>
            </div>
            <ServiceTable services={services} onServiceDeleted={loadServices} />
        </div>
    );
}