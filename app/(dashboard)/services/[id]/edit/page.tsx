"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ServiceForm } from "@/components/services/ServiceForm";
import { getService } from "@/lib/data/storage";
import { Service, ServiceFormData } from "@/types/service.types";
import { toast } from "@/components/ui/toast";

export default function EditServicePage() {
    const params = useParams();
    const router = useRouter();
    const [service, setService] = useState<Service | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        const data = getService(id);
        if (data) {
            setService(data);
        } else {
            toast.add({
                title: "Error",
                description: "Servicio no encontrado",
                type: "error",
            });
            router.push("/services");
        }
        setIsLoading(false);
    }, [params.id, router]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Cargando servicio...</p>
                </div>
            </div>
        );
    }

    if (!service) {
        return <div className="px-4 lg:px-6">Servicio no encontrado</div>;
    }

    const formData: ServiceFormData = {
        clientId: service.clientId,
        clientName: service.clientName,
        computer: service.computer,
        issue: service.issue,
        estimatedDelivery: service.estimatedDelivery,
        technician: service.technician,
        costBreakdown: service.costBreakdown,
        cost: service.cost,
        customerApproved: service.customerApproved,
    };

    return (
        <div className="px-4 lg:px-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push("/services")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Editar Servicio {service.ticketNumber}
                    </h2>
                    <p className="text-gray-500">
                        Cliente: {service.clientName}
                    </p>
                </div>
            </div>

            <ServiceForm mode="edit" serviceId={service.id} initialData={formData} />
        </div>
    );
}