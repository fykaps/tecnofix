'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { cn } from '@/lib/utils';

interface DataPoint {
    day: string;
    servicios: number;
}

interface DailyActivityChartProps {
    data: DataPoint[];
    title?: string;
    className?: string;
}

export function DailyActivityChart({
    data,
    title = 'Actividad Diaria (Últimos 7 días)',
    className,
}: DailyActivityChartProps) {
    return (
        <Card className={cn('border-none shadow-sm', className)}>
            <CardHeader>
                <CardTitle className="text-lg font-semibold">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                            <YAxis stroke="#9ca3af" fontSize={12} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                }}
                                formatter={(value: number) => [`${value} servicios`, 'Servicios']}
                            />
                            <Bar
                                dataKey="servicios"
                                fill="#3b82f6"
                                radius={[4, 4, 0, 0]}
                                name="Servicios"
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}