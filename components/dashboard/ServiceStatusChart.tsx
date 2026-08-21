'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { cn } from '@/lib/utils';

interface DataPoint {
    name: string;
    value: number;
    color: string;
}

interface ServiceStatusChartProps {
    data: DataPoint[];
    title?: string;
    className?: string;
}

export function ServiceStatusChart({
    data,
    title = 'Estado de Servicios',
    className,
}: ServiceStatusChartProps) {
    return (
        <Card className={cn('border-none shadow-sm', className)}>
            <CardHeader>
                <CardTitle className='text-lg font-semibold'>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='h-[300px] flex items-center justify-center'>
                    <ResponsiveContainer width='100%' height='100%'>
                        <PieChart>
                            <Pie
                                data={data}
                                cx='50%'
                                cy='50%'
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={4}
                                dataKey='value'
                                label={({ name, percent }) => {
                                    const pct = percent || 0;
                                    return `${name}: ${(pct * 100).toFixed(0)}%`;
                                }}
                                labelLine={false}
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                        className='hover:opacity-80 transition-opacity cursor-pointer'
                                    />
                                ))}
                            </Pie>
                            {/* ✅ CORREGIDO: Tooltip con formatter que maneja undefined */}
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    padding: '8px 12px',
                                }}
                                formatter={(value, name, item) => {
                                    // ✅ Manejar todos los casos posibles
                                    if (typeof value === 'number') {
                                        return [`${value} servicios`, String(name || 'Servicios')];
                                    }
                                    return [String(value || 0), String(name || 'Servicios')];
                                }}
                            />
                            <Legend
                                verticalAlign='bottom'
                                align='center'
                                iconType='circle'
                                iconSize={10}
                                wrapperStyle={{ paddingTop: 20 }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}