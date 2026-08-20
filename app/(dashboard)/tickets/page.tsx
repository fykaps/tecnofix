"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Search,
    Printer,
    Eye,
    Clock,
    CheckCircle,
    Wrench,
    FileText,
    Calendar,
    User,
} from "lucide-react";
import { Service } from "@/types/service.types";
import { getServices } from "@/lib/data/storage";
import { toast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";

export default function TicketsPage() {
    const router = useRouter();
    const [tickets, setTickets] = useState<Service[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Service[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [isLoading, setIsLoading] = useState(true);

    const loadTickets = () => {
        const services = getServices();
        setTickets(services);
        applyFilters(services, searchTerm, statusFilter, dateFilter);
    };

    const applyFilters = (
        data: Service[],
        term: string,
        status: string,
        date: string
    ) => {
        let filtered = [...data];

        // Búsqueda por texto
        if (term) {
            const searchLower = term.toLowerCase();
            filtered = filtered.filter(
                (s) =>
                    s.ticketNumber?.toLowerCase().includes(searchLower) ||
                    s.clientName?.toLowerCase().includes(searchLower) ||
                    s.computer?.brand?.toLowerCase().includes(searchLower) ||
                    s.computer?.model?.toLowerCase().includes(searchLower)
            );
        }

        // Filtro por estado
        if (status !== "all") {
            filtered = filtered.filter((s) => s.status === status);
        }

        // Filtro por fecha
        if (date !== "all") {
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

            filtered = filtered.filter((s) => {
                const entryDate = new Date(s.entryDate);
                const entryDay = new Date(
                    entryDate.getFullYear(),
                    entryDate.getMonth(),
                    entryDate.getDate()
                );

                if (date === "today") {
                    return entryDay.getTime() === today.getTime();
                } else if (date === "week") {
                    const weekAgo = new Date(today);
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return entryDay >= weekAgo;
                } else if (date === "month") {
                    return (
                        entryDate.getMonth() === now.getMonth() &&
                        entryDate.getFullYear() === now.getFullYear()
                    );
                }
                return true;
            });
        }

        // Ordenar por fecha (más reciente primero)
        filtered.sort(
            (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setFilteredTickets(filtered);
    };

    useEffect(() => {
        loadTickets();
        setIsLoading(false);
    }, []);

    const handleSearch = (term: string) => {
        setSearchTerm(term);
        applyFilters(tickets, term, statusFilter, dateFilter);
    };

    const handleStatusFilter = (status: string) => {
        setStatusFilter(status);
        applyFilters(tickets, searchTerm, status, dateFilter);
    };

    const handleDateFilter = (date: string) => {
        setDateFilter(date);
        applyFilters(tickets, searchTerm, statusFilter, date);
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

    const getStatusIcon = (status: Service["status"]) => {
        const icons = {
            pending: Clock,
            "in-progress": Wrench,
            completed: CheckCircle,
            delivered: CheckCircle,
        };
        const Icon = icons[status] || Clock;
        return <Icon className="h-4 w-4" />;
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

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatDateTime = (dateString: string) => {
        if (!dateString) return "-";
        const date = new Date(dateString);
        return date.toLocaleDateString("es-ES", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    // Estadísticas para el resumen
    const stats = {
        total: filteredTickets.length,
        pending: filteredTickets.filter((s) => s.status === "pending").length,
        inProgress: filteredTickets.filter((s) => s.status === "in-progress").length,
        completed: filteredTickets.filter((s) => s.status === "completed").length,
        delivered: filteredTickets.filter((s) => s.status === "delivered").length,
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando tickets...</p>
                </div>
            </div>
        );
    }

    return (
        // ✅ Padding lateral consistente con las demás páginas
        <div className="px-4 lg:px-6 space-y-6">
            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-gray-900">Tickets</h2>
                <p className="text-gray-500">Gestiona todos los tickets de servicio</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500">Total</p>
                                <p className="text-xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-full">
                                <FileText className="h-4 w-4 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500">Pendientes</p>
                                <p className="text-xl font-bold text-yellow-600">{stats.pending}</p>
                            </div>
                            <div className="p-2 bg-yellow-50 rounded-full">
                                <Clock className="h-4 w-4 text-yellow-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500">En Proceso</p>
                                <p className="text-xl font-bold text-blue-600">{stats.inProgress}</p>
                            </div>
                            <div className="p-2 bg-blue-50 rounded-full">
                                <Wrench className="h-4 w-4 text-blue-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500">Completados</p>
                                <p className="text-xl font-bold text-green-600">{stats.completed}</p>
                            </div>
                            <div className="p-2 bg-green-50 rounded-full">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-gray-500">Entregados</p>
                                <p className="text-xl font-bold text-purple-600">{stats.delivered}</p>
                            </div>
                            <div className="p-2 bg-purple-50 rounded-full">
                                <CheckCircle className="h-4 w-4 text-purple-600" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar ticket, cliente, equipo..."
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los estados</SelectItem>
                            <SelectItem value="pending">Pendiente</SelectItem>
                            <SelectItem value="in-progress">En Proceso</SelectItem>
                            <SelectItem value="completed">Completado</SelectItem>
                            <SelectItem value="delivered">Entregado</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={dateFilter} onValueChange={handleDateFilter}>
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Fecha" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todas las fechas</SelectItem>
                            <SelectItem value="today">Hoy</SelectItem>
                            <SelectItem value="week">Última semana</SelectItem>
                            <SelectItem value="month">Este mes</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Tabla de Tickets */}
            <div className="rounded-md border border-gray-200 overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-gray-50">
                            <TableHead className="w-[120px]">Ticket</TableHead>
                            <TableHead>Cliente</TableHead>
                            <TableHead>Equipo</TableHead>
                            <TableHead>Fecha Ingreso</TableHead>
                            <TableHead>Estado</TableHead>
                            <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredTickets.length === 0 ? (
                            <TableRow>
                                <TableCell
                                    colSpan={6}
                                    className="text-center py-8 text-gray-500"
                                >
                                    {searchTerm ||
                                        statusFilter !== "all" ||
                                        dateFilter !== "all"
                                        ? "No se encontraron tickets con esos filtros"
                                        : "No hay tickets registrados"}
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredTickets.map((ticket) => (
                                <TableRow key={ticket.id} className="hover:bg-gray-50">
                                    <TableCell className="font-mono font-medium text-sm text-blue-600">
                                        {ticket.ticketNumber || "-"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <User className="h-3 w-3 text-gray-400" />
                                            <span className="font-medium">
                                                {ticket.clientName || "-"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <span className="text-sm">
                                                {ticket.computer?.brand || "-"}{" "}
                                                {ticket.computer?.model || ""}
                                            </span>
                                            <span className="text-xs text-gray-500 block">
                                                {ticket.computer?.type || "-"} •{" "}
                                                {ticket.computer?.processor || "-"}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div>
                                            <div className="text-sm">
                                                {formatDate(ticket.entryDate)}
                                            </div>
                                            <div className="text-xs text-gray-400">
                                                {formatDateTime(ticket.entryDate).split(", ")[1] || ""}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            className={cn(
                                                "flex items-center gap-1",
                                                getStatusColor(ticket.status)
                                            )}
                                        >
                                            {getStatusIcon(ticket.status)}
                                            {getStatusLabel(ticket.status)}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() =>
                                                    router.push(`/services/${ticket.id}`)
                                                }
                                                title="Ver detalles"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-blue-600 hover:text-blue-700"
                                                onClick={() =>
                                                    router.push(`/tickets/${ticket.id}`)
                                                }
                                                title="Imprimir ticket"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Resumen de tickets */}
            {filteredTickets.length > 0 && (
                <div className="text-sm text-gray-500 text-center">
                    Mostrando {filteredTickets.length} ticket
                    {filteredTickets.length !== 1 ? "s" : ""}
                    {statusFilter !== "all" &&
                        ` • Estado: ${getStatusLabel(statusFilter as Service["status"])}`}
                    {dateFilter === "today" && " • Solo hoy"}
                    {dateFilter === "week" && " • Última semana"}
                    {dateFilter === "month" && " • Este mes"}
                </div>
            )}
        </div>
    );
}