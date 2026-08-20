"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getService } from "@/lib/data/storage";
import { Service } from "@/types/service.types";
import { TicketPrinter } from "@/components/tickets/TicketPrinter";
import { toast } from "@/components/ui/toast";

export default function TicketPage() {
    const params = useParams();
    const router = useRouter();
    const [service, setService] = useState<Service | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [open, setOpen] = useState(true);

    useEffect(() => {
        const id = params.id as string;
        const data = getService(id);
        if (data) {
            setService(data);
        } else {
            toast.add({
                title: "Error",
                description: "Ticket no encontrado",
                type: "error",
            });
            router.push("/services");
        }
        setIsLoading(false);
    }, [params.id, router]);

    const handleClose = () => {
        setOpen(false);
        router.push("/services");
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!service) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Ticket no encontrado</p>
            </div>
        );
    }

    return (
        // ✅ Padding lateral consistente
        <div className="px-4 lg:px-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push("/services")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Ticket #{service.ticketNumber}
                    </h2>
                    <p className="text-gray-500">Cliente: {service.clientName}</p>
                </div>
            </div>

            <TicketPrinter
                service={service}
                onClose={handleClose}
                open={open}
            />
        </div>
    );
}