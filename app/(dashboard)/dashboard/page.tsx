"use client";

import { useEffect, useState } from "react";
import {
    Users,
    Wrench,
    CheckCircle,
    Clock,
    TrendingUp,
    DollarSign,
    Calendar,
    Activity,
    Wallet,
    TrendingDown,
    Receipt,
    UserCheck,
} from "lucide-react";
import {
    getClients,
    getServices,
    getExpenses,
    getFinancialSummary,
    getTechnicians,
    getAvailableTechnicians,
    getBusyTechnicians,
} from "@/lib/data/storage";
import { Service, Expense, FinancialSummary } from "@/types/service.types";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { ServiceStatusChart } from "@/components/dashboard/ServiceStatusChart";
import { DailyActivityChart } from "@/components/dashboard/DailyActivityChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
    const [stats, setStats] = useState({
        totalClients: 0,
        totalServices: 0,
        pendingServices: 0,
        inProgressServices: 0,
        completedServices: 0,
        deliveredServices: 0,
    });
    const [financial, setFinancial] = useState<FinancialSummary>({
        totalRevenue: 0,
        totalExpenses: 0,
        netProfit: 0,
        profitMargin: 0,
        pendingInvoices: 0,
        averageTicket: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
    });
    const [services, setServices] = useState<Service[]>([]);
    const [recentServices, setRecentServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [monthlyData, setMonthlyData] = useState<
        Array<{ name: string; ingresos: number; servicios: number }>
    >([]);
    const [dailyData, setDailyData] = useState<Array<{ day: string; servicios: number }>>([]);
    const [statusData, setStatusData] = useState<
        Array<{ name: string; value: number; color: string }>
    >([]);
    const [expensesData, setExpensesData] = useState<Array<{ name: string; gastos: number }>>([]);

    const technicians = getTechnicians();
    const available = getAvailableTechnicians();
    const busy = getBusyTechnicians();

    const loadAllData = () => {
        const clients = getClients();
        const servicesData = getServices();
        const expenses = getExpenses();
        const financialData = getFinancialSummary();

        setStats({
            totalClients: clients.length,
            totalServices: servicesData.length,
            pendingServices: servicesData.filter((s) => s.status === "pending").length,
            inProgressServices: servicesData.filter((s) => s.status === "in-progress").length,
            completedServices: servicesData.filter((s) => s.status === "completed").length,
            deliveredServices: servicesData.filter((s) => s.status === "delivered").length,
        });

        setFinancial(financialData);
        setServices(servicesData);

        // Últimos 6 servicios
        const sorted = [...servicesData].sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        setRecentServices(sorted.slice(0, 6));

        // Datos mensuales (últimos 6 meses)
        const now = new Date();
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
        const monthlyRevenueData = Array.from({ length: 6 }, (_, i) => {
            const monthIndex = (now.getMonth() - 5 + i + 12) % 12;
            const monthServices = servicesData.filter((s) => {
                const date = new Date(s.entryDate);
                return date.getMonth() === monthIndex && date.getFullYear() === now.getFullYear();
            });
            const total = monthServices
                .filter((s) => s.status === "delivered" || s.status === "completed")
                .reduce((sum, s) => sum + (s.cost || 0), 0);
            return {
                name: months[monthIndex],
                ingresos: total,
                servicios: monthServices.length,
            };
        });
        setMonthlyData(monthlyRevenueData);

        // Datos diarios (últimos 7 días)
        const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
        const dailyServices = days.map((day, index) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - index));
            const dayServices = servicesData.filter((s) => {
                const entryDate = new Date(s.entryDate);
                return (
                    entryDate.getDate() === date.getDate() &&
                    entryDate.getMonth() === date.getMonth() &&
                    entryDate.getFullYear() === date.getFullYear()
                );
            });
            return {
                day,
                servicios: dayServices.length,
            };
        });
        setDailyData(dailyServices);

        // Datos de estado
        const statusColors: Record<string, string> = {
            pending: "#f59e0b",
            "in-progress": "#3b82f6",
            completed: "#22c55e",
            delivered: "#8b5cf6",
        };
        const statusLabels: Record<string, string> = {
            pending: "Pendiente",
            "in-progress": "En Proceso",
            completed: "Completado",
            delivered: "Entregado",
        };
        const statusChartData = Object.entries(
            servicesData.reduce((acc, s) => {
                acc[s.status] = (acc[s.status] || 0) + 1;
                return acc;
            }, {} as Record<string, number>)
        ).map(([status, count]) => ({
            name: statusLabels[status] || status,
            value: count,
            color: statusColors[status] || "#9ca3af",
        }));
        setStatusData(statusChartData);

        // Datos de gastos mensuales
        const monthlyExpensesData = Array.from({ length: 6 }, (_, i) => {
            const monthIndex = (now.getMonth() - 5 + i + 12) % 12;
            const monthExpenses = expenses.filter((e) => {
                const date = new Date(e.date);
                return date.getMonth() === monthIndex && date.getFullYear() === now.getFullYear();
            });
            return {
                name: months[monthIndex],
                gastos: monthExpenses.reduce((sum, e) => sum + e.amount, 0),
            };
        });
        setExpensesData(monthlyExpensesData);

        setIsLoading(false);
    };

    useEffect(() => {
        loadAllData();

        // Escuchar cambios
        const handleStorageChange = () => {
            loadAllData();
        };

        window.addEventListener("storage", handleStorageChange);
        return () => window.removeEventListener("storage", handleStorageChange);
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600">Cargando datos financieros...</p>
                </div>
            </div>
        );
    }

    const activeServices = stats.pendingServices + stats.inProgressServices;
    const completionRate =
        stats.totalServices > 0
            ? ((stats.completedServices + stats.deliveredServices) / stats.totalServices) * 100
            : 0;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
        }).format(value);
    };

    return (
        // ✅ Padding lateral consistente con las demás páginas
        <div className="px-4 lg:px-6 space-y-6">
            {/* Encabezado */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Panel de Control</h1>
                    <p className="text-gray-500">Bienvenido de vuelta, aquí está el resumen de tu negocio</p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2" />
                        Sistema operativo
                    </Badge>
                </div>
            </div>

            {/* Métricas Financieras */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Ingresos Totales"
                    value={formatCurrency(financial.totalRevenue)}
                    icon={DollarSign}
                    iconBgColor="bg-green-50"
                    iconColor="text-green-600"
                    description={`${stats.deliveredServices} servicios entregados`}
                    trend={{ value: 12, isPositive: true }}
                />
                <MetricCard
                    title="Gastos Totales"
                    value={formatCurrency(financial.totalExpenses)}
                    icon={Receipt}
                    iconBgColor="bg-red-50"
                    iconColor="text-red-600"
                    description="Gastos operativos acumulados"
                    trend={{ value: 5, isPositive: false }}
                />
                <MetricCard
                    title="Ganancia Neta"
                    value={formatCurrency(financial.netProfit)}
                    icon={Wallet}
                    iconBgColor="bg-blue-50"
                    iconColor="text-blue-600"
                    description={`Margen: ${financial.profitMargin.toFixed(1)}%`}
                    trend={{ value: 18, isPositive: true }}
                />
                <MetricCard
                    title="Ticket Promedio"
                    value={formatCurrency(financial.averageTicket)}
                    icon={TrendingUp}
                    iconBgColor="bg-purple-50"
                    iconColor="text-purple-600"
                    description={`${stats.totalServices} servicios totales`}
                />
            </div>

            {/* Métricas de Operación */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Clientes Activos"
                    value={stats.totalClients}
                    icon={Users}
                    iconBgColor="bg-indigo-50"
                    iconColor="text-indigo-600"
                />
                <MetricCard
                    title="Servicios Activos"
                    value={activeServices}
                    icon={Activity}
                    iconBgColor="bg-blue-50"
                    iconColor="text-blue-600"
                    description={`${stats.inProgressServices} en proceso`}
                />
                <MetricCard
                    title="Facturas Pendientes"
                    value={formatCurrency(financial.pendingInvoices)}
                    icon={Clock}
                    iconBgColor="bg-yellow-50"
                    iconColor="text-yellow-600"
                    description="Por cobrar"
                />
                <MetricCard
                    title="Tasa de Completado"
                    value={`${completionRate.toFixed(0)}%`}
                    icon={CheckCircle}
                    iconBgColor="bg-green-50"
                    iconColor="text-green-600"
                    description={`${stats.completedServices + stats.deliveredServices} de ${stats.totalServices}`}
                />
            </div>

            {/* Gráficos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RevenueChart data={monthlyData} title="Ingresos Mensuales" />
                <ServiceStatusChart data={statusData} title="Distribución de Servicios" />
            </div>

            {/* Gráfico de Ingresos vs Gastos */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Ingresos vs Gastos Mensuales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-sm text-gray-500">Ingresos del Mes</p>
                                    <p className="text-xl font-bold text-green-600">
                                        {formatCurrency(financial.monthlyRevenue)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm text-gray-500">Gastos del Mes</p>
                                    <p className="text-xl font-bold text-red-600">
                                        {formatCurrency(financial.monthlyExpenses)}
                                    </p>
                                </div>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">Ganancia del Mes</span>
                                    <span
                                        className={`text-lg font-bold ${financial.monthlyRevenue - financial.monthlyExpenses >= 0
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                    >
                                        {formatCurrency(financial.monthlyRevenue - financial.monthlyExpenses)}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                                        <span>Margen: {financial.profitMargin.toFixed(1)}%</span>
                                        <span>
                                            Eficiencia:{" "}
                                            {financial.totalExpenses > 0
                                                ? (financial.totalRevenue / financial.totalExpenses).toFixed(2)
                                                : 0}
                                            x
                                        </span>
                                    </div>
                                    <Progress
                                        value={financial.profitMargin > 0 ? Math.min(financial.profitMargin, 100) : 0}
                                        className="h-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold">Resumen Financiero</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="h-5 w-5 text-green-600" />
                                    <span className="text-sm font-medium">Total Ingresos</span>
                                </div>
                                <span className="font-bold text-green-600">
                                    {formatCurrency(financial.totalRevenue)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-red-600" />
                                    <span className="text-sm font-medium">Total Gastos</span>
                                </div>
                                <span className="font-bold text-red-600">
                                    {formatCurrency(financial.totalExpenses)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Wallet className="h-5 w-5 text-blue-600" />
                                    <span className="text-sm font-medium">Ganancia Neta</span>
                                </div>
                                <span
                                    className={`font-bold ${financial.netProfit >= 0 ? "text-blue-600" : "text-red-600"
                                        }`}
                                >
                                    {formatCurrency(financial.netProfit)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-purple-600" />
                                    <span className="text-sm font-medium">Ticket Promedio</span>
                                </div>
                                <span className="font-bold text-purple-600">
                                    {formatCurrency(financial.averageTicket)}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-5 w-5 text-yellow-600" />
                                    <span className="text-sm font-medium">Por Cobrar</span>
                                </div>
                                <span className="font-bold text-yellow-600">
                                    {formatCurrency(financial.pendingInvoices)}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Técnicos */}
            <div className="grid grid-cols-1 gap-6">
                <Card className="border-none shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600" />
                            Técnicos
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Total</span>
                                <span className="font-bold">{technicians.length}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Disponibles</span>
                                <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-600 border-green-200"
                                >
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    {available.length}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600">Ocupados</span>
                                <Badge
                                    variant="outline"
                                    className="bg-yellow-50 text-yellow-600 border-yellow-200"
                                >
                                    <Clock className="h-3 w-3 mr-1" />
                                    {busy.length}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Actividad Reciente */}
            <RecentActivity services={services} />
        </div>
    );
}