'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DollarSign, Wrench, Truck, Package, Clock, Info } from 'lucide-react';
import { CostBreakdown } from '@/types/service.types';
import { SERVICE_CATALOG, calculateCostBreakdown } from '@/lib/data/service-prices';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface CostCalculatorProps {
    onCostChange: (costBreakdown: CostBreakdown) => void;
    onServiceTypeChange?: (serviceTypeId: string) => void;
    initialCost?: CostBreakdown;
    issueDescription?: string;
    selectedServiceType?: string;
}

export function CostCalculator({
    onCostChange,
    onServiceTypeChange,
    initialCost,
    issueDescription,
    selectedServiceType: externalSelectedServiceType,
}: CostCalculatorProps) {
    const [serviceType, setServiceType] = useState<string>(externalSelectedServiceType || '');
    const [partsCost, setPartsCost] = useState<number>(initialCost?.parts || 0);
    const [materialsCost, setMaterialsCost] = useState<number>(initialCost?.materials || 0);
    const [includesTravel, setIncludesTravel] = useState<boolean>(initialCost?.travel ? initialCost.travel > 0 : false);
    const [laborHours, setLaborHours] = useState<number>(1);
    const [costBreakdown, setCostBreakdown] = useState<CostBreakdown>({
        labor: initialCost?.labor || 0,
        parts: initialCost?.parts || 0,
        materials: initialCost?.materials || 0,
        travel: initialCost?.travel || 0,
        total: initialCost?.total || 0,
    });

    // ✅ Obtener el nombre del servicio seleccionado
    const getSelectedServiceName = (): string => {
        if (!serviceType) return '';
        const found = SERVICE_CATALOG.find(s => s.id === serviceType);
        return found?.name || '';
    };

    // ✅ Sincronizar con externalSelectedServiceType
    useEffect(() => {
        if (externalSelectedServiceType) {
            setServiceType(externalSelectedServiceType);
            const found = SERVICE_CATALOG.find(s => s.id === externalSelectedServiceType);
            if (found) {
                setLaborHours(found.laborHours);
            }
        }
    }, [externalSelectedServiceType]);

    // ✅ Detectar automáticamente el tipo de servicio por la descripción
    useEffect(() => {
        if (issueDescription && !externalSelectedServiceType) {
            const matchedService = SERVICE_CATALOG.find(s =>
                issueDescription.toLowerCase().includes(s.name.toLowerCase()) ||
                s.name.toLowerCase().includes(issueDescription.toLowerCase())
            );
            if (matchedService) {
                setServiceType(matchedService.id);
                setLaborHours(matchedService.laborHours);
                if (onServiceTypeChange) {
                    onServiceTypeChange(matchedService.id);
                }
            }
        }
    }, [issueDescription, externalSelectedServiceType]);

    // ✅ Cargar valores iniciales cuando hay initialCost
    useEffect(() => {
        if (initialCost) {
            setCostBreakdown(initialCost);
            setPartsCost(initialCost.parts || 0);
            setMaterialsCost(initialCost.materials || 0);
            setIncludesTravel(initialCost.travel > 0);
            const estimatedHours = Math.round(initialCost.labor / 50);
            if (estimatedHours > 0) {
                setLaborHours(estimatedHours);
            }
        }
    }, [initialCost]);

    // Recalcular cada vez que cambia algún parámetro
    useEffect(() => {
        const breakdown = calculateCostBreakdown({
            serviceType: getServiceName(serviceType),
            includesTravel,
            partsCost,
            materialsCost,
            hoursWorked: laborHours,
        });
        setCostBreakdown(breakdown);
        onCostChange(breakdown);
    }, [serviceType, includesTravel, partsCost, materialsCost, laborHours]);

    const getServiceName = (id: string): string => {
        const found = SERVICE_CATALOG.find(s => s.id === id);
        return found?.name || '';
    };

    const getServicePrice = (id: string): number => {
        const found = SERVICE_CATALOG.find(s => s.id === id);
        return found?.basePrice || 0;
    };

    const getServiceCategory = (id: string): string => {
        const found = SERVICE_CATALOG.find(s => s.id === id);
        return found?.category || 'general';
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
            minimumFractionDigits: 2,
        }).format(value);
    };

    // ✅ Manejar cambio de tipo de servicio
    const handleServiceTypeChange = (value: string) => {
        setServiceType(value);
        const found = SERVICE_CATALOG.find(s => s.id === value);
        if (found) {
            setLaborHours(found.laborHours);
        }
        if (onServiceTypeChange) {
            onServiceTypeChange(value);
        }
    };

    return (
        <Card className="border border-blue-100 shadow-sm w-full">
            <CardHeader className="bg-blue-50/50">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    Cotización del Servicio
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-600 border-green-200">
                        <Info className="h-3 w-3 mr-1" />
                        Transparente
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
                <div className="space-y-2 w-full">
                    <Label className="text-sm font-medium">Tipo de Servicio</Label>
                    <Select
                        value={serviceType}
                        onValueChange={(value) => value && handleServiceTypeChange(value)}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona el tipo de servicio">
                                {serviceType ? getSelectedServiceName() : "Selecciona el tipo de servicio"}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="w-full min-w-[300px]">
                            {SERVICE_CATALOG.map((service) => (
                                <SelectItem key={service.id} value={service.id}>
                                    <div className="flex items-center justify-between w-full gap-4">
                                        <span className="font-medium">{service.name}</span>
                                        <span className="text-sm text-gray-500 whitespace-nowrap">
                                            {formatCurrency(service.basePrice)}
                                        </span>
                                    </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {serviceType && (
                        <p className="text-xs text-gray-500">
                            Categoría: <span className="font-medium">{getServiceCategory(serviceType)}</span> •
                            Precio base: <span className="font-medium">{formatCurrency(getServicePrice(serviceType))}</span>
                        </p>
                    )}
                </div>

                <Separator />

                {/* Desglose de costos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium">Horas de Trabajo</Label>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <Input
                                type="number"
                                value={laborHours}
                                onChange={(e) => setLaborHours(Number(e.target.value))}
                                min={0.5}
                                step={0.5}
                                className="w-20"
                            />
                            <span className="text-sm text-gray-500">horas</span>
                        </div>
                        <p className="text-xs text-gray-400">Tarifa por hora: S/ 50.00</p>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Truck className="h-4 w-4 text-gray-400" />
                            Servicio a Domicilio
                        </Label>
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id="travel"
                                checked={includesTravel}
                                onCheckedChange={(checked) => setIncludesTravel(checked as boolean)}
                            />
                            <Label htmlFor="travel" className="text-sm cursor-pointer">
                                Incluir traslado <span className="text-gray-400">(S/ 25.00)</span>
                            </Label>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-400" />
                            Repuestos
                        </Label>
                        <Input
                            type="number"
                            value={partsCost}
                            onChange={(e) => setPartsCost(Number(e.target.value))}
                            min={0}
                            step={5}
                            className="w-full"
                            placeholder="Costo de repuestos"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium flex items-center gap-2">
                            <Wrench className="h-4 w-4 text-gray-400" />
                            Materiales
                        </Label>
                        <Input
                            type="number"
                            value={materialsCost}
                            onChange={(e) => setMaterialsCost(Number(e.target.value))}
                            min={0}
                            step={5}
                            className="w-full"
                            placeholder="Materiales (pasta térmica, etc.)"
                        />
                    </div>
                </div>

                <Separator />

                {/* Resumen de costos */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Mano de obra</span>
                        <span className="font-medium">{formatCurrency(costBreakdown.labor)}</span>
                    </div>
                    {costBreakdown.parts > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Repuestos</span>
                            <span className="font-medium">{formatCurrency(costBreakdown.parts)}</span>
                        </div>
                    )}
                    {costBreakdown.materials > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Materiales</span>
                            <span className="font-medium">{formatCurrency(costBreakdown.materials)}</span>
                        </div>
                    )}
                    {costBreakdown.travel > 0 && (
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Traslado (domicilio)</span>
                            <span className="font-medium">{formatCurrency(costBreakdown.travel)}</span>
                        </div>
                    )}
                    <Separator className="my-2" />
                    <div className="flex justify-between items-center">
                        <span className="text-base font-bold text-gray-900">Total del Servicio</span>
                        <span className="text-xl font-bold text-blue-600">
                            {formatCurrency(costBreakdown.total)}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400 text-center">
                        * Este es un presupuesto estimado. El costo final puede variar según el diagnóstico técnico.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}