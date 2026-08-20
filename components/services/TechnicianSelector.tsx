'use client';

import { useState, useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, User, Phone, Mail } from 'lucide-react';
import { Technician } from '@/types/service.types';
import { getTechnicians } from '@/lib/data/storage';
import { toast } from '@/components/ui/toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select as MultiSelect,
    SelectContent as MultiSelectContent,
    SelectItem as MultiSelectItem,
    SelectTrigger as MultiSelectTrigger,
    SelectValue as MultiSelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TechnicianSelectorProps {
    value: string;
    onChange: (technicianId: string, technicianName: string) => void;
    disabled?: boolean;
    showAddTechnician?: boolean;
}

export function TechnicianSelector({
    value,
    onChange,
    disabled = false,
    showAddTechnician = true,
}: TechnicianSelectorProps) {
    const [technicians, setTechnicians] = useState<Technician[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const [newTechnician, setNewTechnician] = useState({
        name: '',
        phone: '',
        email: '',
        specialty: [] as string[],
    });

    const loadTechnicians = () => {
        const all = getTechnicians();
        setTechnicians(all);
    };

    useEffect(() => {
        loadTechnicians();
    }, []);

    const handleTechnicianChange = (technicianId: string) => {
        const tech = technicians.find(t => t.id === technicianId);
        if (tech) {
            onChange(tech.id, tech.name);
        }
    };

    const getStatusBadge = (status: Technician['status']) => {
        const variants = {
            available: <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px] px-1.5 py-0">Disponible</Badge>,
            busy: <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200 text-[10px] px-1.5 py-0">Ocupado</Badge>,
            off: <Badge className="bg-gray-100 text-gray-700 border-gray-200 text-[10px] px-1.5 py-0">Descanso</Badge>,
        };
        return variants[status] || variants.available;
    };

    const getStatusColor = (status: Technician['status']) => {
        const colors = {
            available: 'text-green-600',
            busy: 'text-yellow-600',
            off: 'text-gray-500',
        };
        return colors[status] || colors.available;
    };

    const getStatusEmoji = (status: Technician['status']) => {
        const emojis = {
            available: '✅',
            busy: '⏳',
            off: '⏰',
        };
        return emojis[status] || '✅';
    };

    const handleCreateTechnician = () => {
        if (!newTechnician.name || !newTechnician.phone) {
            toast.add({
                title: 'Campos requeridos',
                description: 'Nombre y teléfono son obligatorios',
                type: 'error',
            });
            return;
        }

        try {
            const tech: Technician = {
                id: `tec-${Date.now()}`,
                name: newTechnician.name,
                phone: newTechnician.phone,
                email: newTechnician.email || '',
                specialty: newTechnician.specialty.length > 0 ? newTechnician.specialty : ['general'],
                status: 'available',
                currentServiceId: undefined,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };

            const all = getTechnicians();
            all.push(tech);
            localStorage.setItem('tecnoFix_technicians', JSON.stringify(all));

            loadTechnicians();
            onChange(tech.id, tech.name);

            setNewTechnician({ name: '', phone: '', email: '', specialty: [] });
            setIsDialogOpen(false);

            toast.add({
                title: 'Técnico creado',
                description: `${tech.name} ha sido registrado exitosamente`,
                type: 'success'
            });
        } catch (error) {
            toast.add({
                title: 'Error',
                description: 'No se pudo crear el técnico',
                type: 'error'
            });
        }
    };

    const specialtyOptions = [
        { value: 'hardware', label: 'Hardware' },
        { value: 'software', label: 'Software' },
        { value: 'security', label: 'Seguridad' },
        { value: 'networks', label: 'Redes' },
        { value: 'data-recovery', label: 'Recuperación de Datos' },
        { value: 'peripherals', label: 'Periféricos' },
        { value: 'diagnostic', label: 'Diagnóstico' },
        { value: 'support', label: 'Soporte' },
        { value: 'gaming', label: 'Gaming' },
        { value: 'maintenance', label: 'Mantenimiento' },
    ];

    const selectedTechnician = technicians.find(t => t.id === value);

    const getSpecialtyLabel = (value: string) => {
        const found = specialtyOptions.find(s => s.value === value);
        return found?.label || value;
    };

    return (
        <div className="space-y-2 w-full">
            <div className="flex items-center gap-2 w-full">
                <div className="flex-1 min-w-0">
                    <Select
                        value={value}
                        onValueChange={(technicianId) => technicianId && handleTechnicianChange(technicianId)}
                        disabled={disabled}
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecciona un técnico">
                                {selectedTechnician ? (
                                    <div className="flex items-center gap-2 min-w-0">
                                        <span className="font-medium truncate">{selectedTechnician.name}</span>
                                        <span className="text-xs text-gray-400 hidden sm:inline truncate">
                                            {selectedTechnician.specialty.slice(0, 2).map(s => getSpecialtyLabel(s)).join(', ')}
                                            {selectedTechnician.specialty.length > 2 && ` +${selectedTechnician.specialty.length - 2}`}
                                        </span>
                                        {getStatusBadge(selectedTechnician.status)}
                                    </div>
                                ) : (
                                    "Selecciona un técnico"
                                )}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                            <ScrollArea className="max-h-[280px]">
                                {technicians.length === 0 ? (
                                    <div className="p-4 text-center text-sm text-gray-500">
                                        No hay técnicos registrados
                                    </div>
                                ) : (
                                    technicians.map((tech) => (
                                        <SelectItem key={tech.id} value={tech.id} className="py-2">
                                            <div className="flex flex-col w-full gap-0.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <div className="flex items-center gap-2 min-w-0">
                                                        <span className="font-medium text-sm truncate">{tech.name}</span>
                                                        {getStatusBadge(tech.status)}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 flex-wrap">
                                                    <span className="flex items-center gap-0.5">
                                                        <Phone className="h-3 w-3" />
                                                        {tech.phone}
                                                    </span>
                                                    {tech.email && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-0.5 truncate max-w-[120px]">
                                                                <Mail className="h-3 w-3 flex-shrink-0" />
                                                                {tech.email}
                                                            </span>
                                                        </>
                                                    )}
                                                    <span>•</span>
                                                    <span className="flex gap-0.5 flex-wrap">
                                                        {tech.specialty.slice(0, 3).map((s) => (
                                                            <Badge key={s} variant="secondary" className="text-[9px] px-1 py-0">
                                                                {getSpecialtyLabel(s)}
                                                            </Badge>
                                                        ))}
                                                        {tech.specialty.length > 3 && (
                                                            <span className="text-gray-400 text-[10px]">
                                                                +{tech.specialty.length - 3}
                                                            </span>
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </ScrollArea>
                        </SelectContent>
                    </Select>
                </div>

                {showAddTechnician && (
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 flex-shrink-0 px-3"
                        onClick={() => setIsDialogOpen(true)}
                        disabled={disabled}
                    >
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Nuevo</span>
                    </Button>
                )}
            </div>

            {/* Información del técnico seleccionado */}
            {selectedTechnician && !disabled && (
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-md px-3 py-1.5">
                    <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {selectedTechnician.name}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                        <Phone className="h-3 w-3" />
                        {selectedTechnician.phone}
                    </span>
                    {selectedTechnician.email && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-0.5 truncate max-w-[150px]">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                {selectedTechnician.email}
                            </span>
                        </>
                    )}
                    <span>•</span>
                    <span className="flex gap-0.5">
                        {selectedTechnician.specialty.slice(0, 3).map((s) => (
                            <Badge key={s} variant="secondary" className="text-[9px] px-1.5 py-0">
                                {getSpecialtyLabel(s)}
                            </Badge>
                        ))}
                        {selectedTechnician.specialty.length > 3 && (
                            <span className="text-gray-400 text-[10px]">+{selectedTechnician.specialty.length - 3}</span>
                        )}
                    </span>
                    <span className={`ml-auto ${getStatusColor(selectedTechnician.status)} text-xs font-medium`}>
                        {getStatusEmoji(selectedTechnician.status)} {selectedTechnician.status === 'available' && 'Disponible'}
                        {selectedTechnician.status === 'busy' && 'Ocupado'}
                        {selectedTechnician.status === 'off' && 'Descanso'}
                    </span>
                </div>
            )}

            {/* Diálogo para crear técnico */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Nuevo Técnico</DialogTitle>
                        <DialogDescription>
                            Registra un nuevo técnico en el sistema.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Nombre Completo *</Label>
                            <Input
                                placeholder="Nombre del técnico"
                                value={newTechnician.name}
                                onChange={(e) => setNewTechnician(prev => ({ ...prev, name: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Teléfono *</Label>
                            <Input
                                placeholder="Número de teléfono"
                                value={newTechnician.phone}
                                onChange={(e) => setNewTechnician(prev => ({ ...prev, phone: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email (opcional)</Label>
                            <Input
                                type="email"
                                placeholder="correo@tecnofix.com"
                                value={newTechnician.email}
                                onChange={(e) => setNewTechnician(prev => ({ ...prev, email: e.target.value }))}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Especialidades</Label>
                            <MultiSelect
                                value={newTechnician.specialty.join(',')}
                                onValueChange={(value) => {
                                    if (value) {
                                        const selected = value.split(',').filter(Boolean);
                                        setNewTechnician(prev => ({ ...prev, specialty: selected }));
                                    }
                                }}
                            >
                                <MultiSelectTrigger className="w-full">
                                    <MultiSelectValue placeholder="Selecciona especialidades" />
                                </MultiSelectTrigger>
                                <MultiSelectContent>
                                    {specialtyOptions.map((spec) => (
                                        <MultiSelectItem key={spec.value} value={spec.value}>
                                            {spec.label}
                                        </MultiSelectItem>
                                    ))}
                                </MultiSelectContent>
                            </MultiSelect>
                            {newTechnician.specialty.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {newTechnician.specialty.map((spec) => (
                                        <Badge key={spec} variant="secondary" className="text-xs">
                                            {getSpecialtyLabel(spec)}
                                        </Badge>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="button"
                            onClick={handleCreateTechnician}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            Crear Técnico
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}