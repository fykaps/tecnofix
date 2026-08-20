"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
    ArrowLeft,
    Printer,
    Pencil,
    Wrench,
    User,
    Calendar,
    Clock,
    Monitor,
    Cpu,
    HardDrive,
    Laptop,
} from "lucide-react";
import { getService, updateServiceStatus } from "@/lib/data/storage";
import { Service } from "@/types/service.types";
import { toast } from "@/components/ui/toast";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function ServiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const [service, setService] = useState<Service | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadService = () => {
        const id = params.id as string;
        const data = getService(id);
        if (data) {
            setService(data);
        } else {
            toast({
                title: "Error",
                description: "Servicio no encontrado",
                variant: "destructive",
            });
            router.push("/services");
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadService();
    }, [params.id, router]);

    const handleStatusChange = (newStatus: Service["status"]) => {
        if (!service) return;
        try {
            updateServiceStatus(service.id, newStatus);
            loadService();
            toast.add({
                title: "Estado actualizado",
                description: `El servicio ha sido actualizado a ${getStatusLabel(newStatus)}`,
                type: 'success'
            });
        } catch (error) {
            toast.add({
                title: "Error",
                description: "No se pudo actualizar el estado",
                type: 'error'
            });
        }
    };

    const getStatusColor = (status: Service["status"]) => {
        const colors = {
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
            completed: "bg-green-100 text-green-800 border-green-200",
            delivered: "bg-purple-100 text-purple-800 border-purple-200",
        };
        return colors[status] || colors.pending;
    };

    const getStatusLabel = (status: Service["status"]) => {
        const labels = {
            pending: "Pendiente",
            "in-progress": "En Proceso",
            completed: "Completado",
            delivered: "Entregado",
        };
        return labels[status] || status;
    };

    const getTypeIcon = (type: string) => {
        const icons: Record<string, any> = {
            Desktop: Monitor,
            Laptop: Laptop,
            "All-in-One": Monitor,
        };
        const Icon = icons[type] || Monitor;
        return <Icon className="h-4 w-4" />;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
        });
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
        }).format(value);
    };

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
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-gray-500">Servicio no encontrado</p>
            </div>
        );
    }

    return (
        // ✅ Padding lateral consistente con las demás páginas
        <div className="px-4 lg:px-6 space-y-6 max-w-6xl mx-auto">
            {/* Cabecera */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" onClick={() => router.push("/services")}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {service.ticketNumber}
                        </h2>
                        <p className="text-gray-500">Cliente: {service.clientName}</p>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <Select
                        value={service.status}
                        onValueChange={(value) =>
                            handleStatusChange(value as Service["status"])
                        }
                    >
                        <SelectTrigger className="w-[160px]">
                            <SelectValue>
                                <Badge className={getStatusColor(service.status)}>
                                    {getStatusLabel(service.status)}
                                </Badge>
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="in-progress">En Proceso</SelectItem>
                            <SelectItem value="completed">Completado</SelectItem>
                            <SelectItem value="delivered">Entregado</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/tickets/${service.id}`)}
                    >
                        <Printer className="h-4 w-4 mr-2" />
                        Ticket
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => router.push(`/services/${service.id}/edit`)}
                    >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                    </Button>
                </div>
            </div>

            {/* Información del Cliente y Equipo */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Información del Cliente */}
                <Card className="border-none shadow-sm lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <User className="h-5 w-5 text-blue-600" />
                            Cliente
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div>
                            <p className="text-sm text-gray-500">Nombre</p>
                            <p className="font-medium">{service.clientName}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-gray-500">Ticket</p>
                            <p className="font-mono font-medium">{service.ticketNumber}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-gray-500">Fecha de Ingreso</p>
                            <p className="font-medium">{formatDateTime(service.entryDate)}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-sm text-gray-500">Entrega Estimada</p>
                            <p className="font-medium">{formatDate(service.estimatedDelivery)}</p>
                        </div>
                        {service.deliveredDate && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-gray-500">Fecha de Entrega</p>
                                    <p className="font-medium">
                                        {formatDateTime(service.deliveredDate)}
                                    </p>
                                </div>
                            </>
                        )}
                        <Separator />
                        <div>
                            <p className="text-sm text-gray-500">Técnico Responsable</p>
                            <p className="font-medium">
                                {service.technicianName || service.technician || "No asignado"}
                            </p>
                        </div>
                        {service.cost && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-gray-500">Costo</p>
                                    <p className="font-medium text-green-600">
                                        {formatCurrency(service.cost)}
                                    </p>
                                </div>
                            </>
                        )}
                        {service.costBreakdown && (
                            <>
                                <Separator />
                                <div className="text-sm">
                                    <p className="text-gray-500">Desglose de Costos</p>
                                    <div className="mt-1 space-y-0.5">
                                        {service.costBreakdown.labor > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Mano de obra</span>
                                                <span>{formatCurrency(service.costBreakdown.labor)}</span>
                                            </div>
                                        )}
                                        {service.costBreakdown.parts > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Repuestos</span>
                                                <span>{formatCurrency(service.costBreakdown.parts)}</span>
                                            </div>
                                        )}
                                        {service.costBreakdown.materials > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Materiales</span>
                                                <span>{formatCurrency(service.costBreakdown.materials)}</span>
                                            </div>
                                        )}
                                        {service.costBreakdown.travel > 0 && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-600">Traslado</span>
                                                <span>{formatCurrency(service.costBreakdown.travel)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Información del Equipo */}
                <Card className="border-none shadow-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Monitor className="h-5 w-5 text-blue-600" />
                            Equipo
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">Marca y Modelo</p>
                                <p className="font-medium">
                                    {service.computer.brand} {service.computer.model}
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-500">Tipo:</p>
                                <Badge variant="outline" className="flex items-center gap-1">
                                    {getTypeIcon(service.computer.type)}
                                    {service.computer.type}
                                </Badge>
                            </div>
                        </div>

                        <Separator />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <Cpu className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Procesador</p>
                                    <p className="font-medium">{service.computer.processor}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <HardDrive className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">RAM</p>
                                    <p className="font-medium">{service.computer.ram}</p>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-start gap-3">
                                <HardDrive className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Almacenamiento</p>
                                    <p className="font-medium">{service.computer.storage}</p>
                                </div>
                            </div>
                            {service.computer.graphics && (
                                <div className="flex items-start gap-3">
                                    <Monitor className="h-5 w-5 text-gray-400 mt-0.5" />
                                    <div>
                                        <p className="text-sm text-gray-500">Gráficos</p>
                                        <p className="font-medium">{service.computer.graphics}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div>
                            <div className="flex items-start gap-3">
                                <Monitor className="h-5 w-5 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-sm text-gray-500">Sistema Operativo</p>
                                    <p className="font-medium">{service.computer.operatingSystem}</p>
                                </div>
                            </div>
                        </div>

                        {service.computer.observations && (
                            <>
                                <Separator />
                                <div>
                                    <p className="text-sm text-gray-500">Observaciones del Equipo</p>
                                    <p className="text-sm bg-gray-50 p-3 rounded-md mt-1">
                                        {service.computer.observations}
                                    </p>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Problema y Diagnóstico */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-yellow-600" />
                            Problema Reportado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-gray-700 whitespace-pre-wrap">{service.issue}</p>
                    </CardContent>
                </Card>

                {service.diagnosis && (
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold flex items-center gap-2">
                                <Wrench className="h-5 w-5 text-blue-600" />
                                Diagnóstico y Reparación
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Diagnóstico</p>
                                <p className="text-gray-700 whitespace-pre-wrap">{service.diagnosis}</p>
                            </div>
                            {service.repairDetails && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-gray-500">Detalles de Reparación</p>
                                        <p className="text-gray-700 whitespace-pre-wrap">
                                            {service.repairDetails}
                                        </p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}