"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import { useIsMobile } from "@/hooks/use-mobile";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    ToggleGroup,
    ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { getServices } from "@/lib/data/storage";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const chartConfig = {
    visitors: {
        label: "Visitors",
    },
    desktop: {
        label: "Desktop",
        color: "var(--primary)",
    },
    mobile: {
        label: "Mobile",
        color: "var(--primary)",
    },
} satisfies ChartConfig;

export function ChartAreaInteractive() {
    const isMobile = useIsMobile();
    const [timeRange, setTimeRange] = React.useState("90d");
    const [chartData, setChartData] = React.useState<any[]>([]);
    const [isClient, setIsClient] = React.useState(false);

    React.useEffect(() => {
        setIsClient(true);
        if (isMobile) {
            setTimeRange("30d");
        }
    }, [isMobile]);

    React.useEffect(() => {
        if (!isClient) return;

        // Obtener datos reales de servicios
        const services = getServices();
        const now = new Date();
        const dataMap: Record<string, { date: string; servicios: number; ingresos: number }> = {};

        services.forEach((service) => {
            const date = new Date(service.entryDate);
            const key = format(date, "yyyy-MM-dd");
            if (!dataMap[key]) {
                dataMap[key] = { date: key, servicios: 0, ingresos: 0 };
            }
            dataMap[key].servicios += 1;
            dataMap[key].ingresos += service.cost || 0;
        });

        const sortedData = Object.values(dataMap).sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Si no hay datos, usar datos de ejemplo
        if (sortedData.length === 0) {
            const months = ["2024-04-01", "2024-05-01", "2024-06-01", "2024-07-01", "2024-08-01"];
            months.forEach((date) => {
                sortedData.push({
                    date,
                    servicios: Math.floor(Math.random() * 10) + 1,
                    ingresos: Math.random() * 500 + 100,
                });
            });
        }

        setChartData(sortedData);
    }, [isClient]);

    // ✅ Filtrar datos según el rango de tiempo seleccionado
    const filteredData = React.useMemo(() => {
        if (chartData.length === 0) return [];
        const referenceDate = new Date();
        let daysToSubtract = 90;
        if (timeRange === "30d") {
            daysToSubtract = 30;
        } else if (timeRange === "7d") {
            daysToSubtract = 7;
        }
        const startDate = new Date(referenceDate);
        startDate.setDate(startDate.getDate() - daysToSubtract);
        return chartData.filter((item) => {
            const date = new Date(item.date);
            return date >= startDate;
        });
    }, [chartData, timeRange]);

    // ✅ Si no hay datos o aún no está en el cliente, mostrar loading
    if (!isClient || filteredData.length === 0) {
        return (
            <Card className="@container/card">
                <CardHeader>
                    <CardTitle>Servicios por Día</CardTitle>
                    <CardDescription>
                        <span className="hidden @[540px]/card:block">
                            Actividad de los últimos 3 meses
                        </span>
                        <span className="@[540px]/card:hidden">Últimos 3 meses</span>
                    </CardDescription>
                </CardHeader>
                <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                    <div className="flex items-center justify-center h-[250px] w-full bg-gray-50 rounded-lg">
                        <p className="text-gray-400 text-sm">Cargando datos...</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="@container/card">
            <CardHeader>
                <CardTitle>Servicios por Día</CardTitle>
                <CardDescription>
                    <span className="hidden @[540px]/card:block">
                        Actividad de los últimos 3 meses
                    </span>
                    <span className="@[540px]/card:hidden">Últimos 3 meses</span>
                </CardDescription>
                <CardAction>
                    <ToggleGroup
                        type="single"
                        value={timeRange}
                        onValueChange={setTimeRange}
                        variant="outline"
                        className="hidden *:data-[slot=toggle-group-item]:px-4! @[767px]/card:flex"
                    >
                        <ToggleGroupItem value="90d">Últimos 3 meses</ToggleGroupItem>
                        <ToggleGroupItem value="30d">Últimos 30 días</ToggleGroupItem>
                        <ToggleGroupItem value="7d">Últimos 7 días</ToggleGroupItem>
                    </ToggleGroup>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger
                            className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
                            size="sm"
                            aria-label="Select a value"
                        >
                            <SelectValue placeholder="Últimos 3 meses" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="90d" className="rounded-lg">
                                Últimos 3 meses
                            </SelectItem>
                            <SelectItem value="30d" className="rounded-lg">
                                Últimos 30 días
                            </SelectItem>
                            <SelectItem value="7d" className="rounded-lg">
                                Últimos 7 días
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </CardAction>
            </CardHeader>
            <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
                {/* ✅ Contenedor con dimensiones fijas para el gráfico */}
                <div className="w-full h-[250px]">
                    <ChartContainer
                        config={chartConfig}
                        className="w-full h-full"
                    >
                        <AreaChart
                            data={filteredData}
                            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="fillDesktop" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-desktop)"
                                        stopOpacity={1.0}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-desktop)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                                <linearGradient id="fillMobile" x1="0" y1="0" x2="0" y2="1">
                                    <stop
                                        offset="5%"
                                        stopColor="var(--color-mobile)"
                                        stopOpacity={0.8}
                                    />
                                    <stop
                                        offset="95%"
                                        stopColor="var(--color-mobile)"
                                        stopOpacity={0.1}
                                    />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="date"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                minTickGap={32}
                                tickFormatter={(value) => {
                                    const date = new Date(value);
                                    return date.toLocaleDateString("es-ES", {
                                        month: "short",
                                        day: "numeric",
                                    });
                                }}
                            />
                            <ChartTooltip
                                cursor={false}
                                content={
                                    <ChartTooltipContent
                                        labelFormatter={(value) => {
                                            return new Date(value).toLocaleDateString("es-ES", {
                                                month: "short",
                                                day: "numeric",
                                            });
                                        }}
                                        indicator="dot"
                                    />
                                }
                            />
                            <Area
                                dataKey="ingresos"
                                type="natural"
                                fill="url(#fillDesktop)"
                                stroke="var(--color-desktop)"
                                stackId="a"
                                name="Ingresos"
                            />
                            <Area
                                dataKey="servicios"
                                type="natural"
                                fill="url(#fillMobile)"
                                stroke="var(--color-mobile)"
                                stackId="a"
                                name="Servicios"
                            />
                        </AreaChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
    );
}