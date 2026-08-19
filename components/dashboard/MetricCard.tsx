"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, type LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: LucideIcon;
    description?: string;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    className?: string;
    iconBgColor?: string;
    iconColor?: string;
    children?: ReactNode;
}

export function MetricCard({
    title,
    value,
    icon: Icon,
    description,
    trend,
    className,
    iconBgColor = "bg-blue-50",
    iconColor = "text-blue-600",
    children,
}: MetricCardProps) {
    return (
        <Card className={cn("border-none shadow-sm hover:shadow-md transition-all duration-200", className)}>
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
                        <p className="text-2xl font-bold text-gray-900 truncate">{value}</p>
                        {description && (
                            <p className="text-xs text-gray-400 truncate">{description}</p>
                        )}
                        {trend && (
                            <div className="flex items-center gap-1 mt-1">
                                <span className={cn(
                                    "inline-flex items-center gap-0.5 text-xs font-medium",
                                    trend.isPositive ? "text-green-600" : "text-red-600"
                                )}>
                                    {trend.isPositive ? (
                                        <ArrowUp className="h-3 w-3" />
                                    ) : (
                                        <ArrowDown className="h-3 w-3" />
                                    )}
                                    {Math.abs(trend.value)}%
                                </span>
                                <span className="text-xs text-gray-400">vs mes anterior</span>
                            </div>
                        )}
                        {children}
                    </div>
                    <div className={cn("p-3 rounded-full flex-shrink-0", iconBgColor)}>
                        <Icon className={cn("h-5 w-5 sm:h-6 sm:w-6", iconColor)} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}