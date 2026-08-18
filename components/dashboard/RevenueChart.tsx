'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import { cn } from '@/lib/utils';

interface DataPoint {
    name: string;
    ingresos: number;
    servicios: number;
}

interface RevenueChartProps {
    data: DataPoint[];
    title?: string;
    className?: string;
}

export function RevenueChart({ data, title = 'Ingresos Mensuales', className }: RevenueChartProps) {
    const formatCurrency = (value: number) => {
        return `S/ ${value.toFixed(2)}`;
    };

    return (
        <Card className={cn('border-none shadow-sm', className)}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data}>
                            <defs>
                                <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={formatCurrency} />
                            <Tooltip
                                formatter={(value: number) => formatCurrency(value)}
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="ingresos"
                                stroke="#3b82f6"
                                strokeWidth={2}
                                fill="url(#colorIngresos)"
                                name="Ingresos"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}