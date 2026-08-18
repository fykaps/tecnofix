'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TicketPrinter } from '@/components/tickets/TicketPrinter';
import { getService } from '@/lib/data/storage';
import { Service } from '@/types/service.types';
import { ArrowLeft } from 'lucide-react';
import { toast } from '@/components/ui/toast';

export default function TicketPage() {
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
                title: 'Error',
                description: 'Ticket no encontrado',
                type: 'error',
            });
            router.push('/services');
        }
        setIsLoading(false);
    }, [params.id, router]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-64">Cargando ticket...</div>;
    }

    if (!service) {
        return <div className="flex items-center justify-center h-64">Ticket no encontrado</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push('/services')}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Ticket #{service.ticketNumber}</h2>
                    <p className="text-gray-500">Cliente: {service.clientName}</p>
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Ticket de Servicio</CardTitle>
                </CardHeader>
                <CardContent>
                    <TicketPrinter service={service} onClose={() => router.push('/services')} />
                </CardContent>
            </Card>
        </div>
    );
}