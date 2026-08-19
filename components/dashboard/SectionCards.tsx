"use client";

import { useEffect, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import { getServices, getClients, getFinancialSummary } from "@/lib/data/storage";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardAction,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export function SectionCards() {
    const [stats, setStats] = useState({
        totalRevenue: 0,
        totalClients: 0,
        totalServices: 0,
        completedServices: 0,
        growth: 12.5,
    });

    useEffect(() => {
        const clients = getClients();
        const services = getServices();
        const financial = getFinancialSummary();

        const completed = services.filter(s => s.status === "delivered" || s.status === "completed");

        setStats({
            totalRevenue: financial.totalRevenue,
            totalClients: clients.length,
            totalServices: services.length,
            completedServices: completed.length,
            growth: financial.profitMargin || 12.5,
        });
    }, []);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2,
        }).format(value);
    };

    const cards = [
        {
            title: "Ingresos Totales",
            value: formatCurrency(stats.totalRevenue),
            description: "Visitors for the last 6 months",
            trend: { value: stats.growth, isPositive: stats.growth > 0 },
            badge: `${stats.growth > 0 ? "+" : ""}${stats.growth.toFixed(1)}%`,
        },
        {
            title: "Clientes Activos",
            value: stats.totalClients.toLocaleString(),
            description: "Acquisition needs attention",
            trend: { value: 8, isPositive: true },
            badge: "+8%",
        },
        {
            title: "Servicios Realizados",
            value: stats.totalServices.toLocaleString(),
            description: "Engagement exceed targets",
            trend: { value: 15, isPositive: true },
            badge: "+15%",
        },
        {
            title: "Tasa de Completado",
            value: stats.totalServices > 0
                ? `${((stats.completedServices / stats.totalServices) * 100).toFixed(0)}%`
                : "0%",
            description: "Meets growth projections",
            trend: { value: 4.5, isPositive: true },
            badge: "+4.5%",
        },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4 dark:*:data-[slot=card]:bg-card">
            {cards.map((card, index) => (
                <Card key={index} className="@container/card">
                    <CardHeader>
                        <CardDescription>{card.title}</CardDescription>
                        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            {card.value}
                        </CardTitle>
                        <CardAction>
                            <Badge variant="outline">
                                {card.trend.isPositive ? (
                                    <TrendingUp className="h-3 w-3" />
                                ) : (
                                    <TrendingDown className="h-3 w-3" />
                                )}
                                {card.badge}
                            </Badge>
                        </CardAction>
                    </CardHeader>
                    <CardFooter className="flex-col items-start gap-1.5 text-sm">
                        <div className="line-clamp-1 flex gap-2 font-medium">
                            {card.trend.isPositive ? (
                                <>
                                    Trending up this month <TrendingUp className="size-4" />
                                </>
                            ) : (
                                <>
                                    Down this period <TrendingDown className="size-4" />
                                </>
                            )}
                        </div>
                        <div className="text-muted-foreground">{card.description}</div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}