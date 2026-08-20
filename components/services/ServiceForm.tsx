'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
    serviceSchema,
    ServiceFormValues,
} from '@/lib/validations/service.schema';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';

import { Input } from '@/components/ui/input';

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { Textarea } from '@/components/ui/textarea';

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

import { toast } from '@/components/ui/toast';

import { Client } from '@/types/client.types';

import {
    getClients,
    saveService,
    generateId,
    generateTicketNumber,
    getService,
} from '@/lib/data/storage';

import {
    CostBreakdown,
    Service,
} from '@/types/service.types';

import { CostCalculator } from './CostCalculator';

import {
    Search,
    UserPlus,
    CheckCircle,
    AlertCircle,
    Save,
    History,
    Sparkles,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';

import {
    Alert,
    AlertDescription,
    AlertTitle,
} from '@/components/ui/alert';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';

import { cn } from '@/lib/utils';

import { SERVICE_CATALOG } from '@/lib/data/service-prices';
import { TechnicianSelector } from './TechnicianSelector';

// =============================================================
// DATOS PARA GENERACIÓN ALEATORIA
// =============================================================

// Problemas comunes por categoría
const PROBLEMS_BY_CATEGORY: Record<string, string[]> = {
    hardware: [
        'La computadora no enciende, solo parpadea el LED de carga.',
        'La pantalla muestra líneas horizontales y verticales de colores.',
        'El disco duro hace ruido de clics constantemente.',
        'La laptop se apaga repentinamente después de unos minutos de uso.',
        'El ventilador hace un ruido fuerte como de rozamiento.',
        'El puerto USB está suelto, el cable se desconecta con cualquier movimiento.',
        'La batería no retiene carga, solo dura 20-30 minutos desconectada.',
        'El equipo se sobrecalienta y se apaga al jugar o en tareas pesadas.',
        'El teclado tiene varias teclas que no responden.',
        'La bisagra de la pantalla está rota, no se mantiene firme.',
        'El cargador hace ruido al conectarlo y la batería no carga.',
        'El equipo no reconoce el disco duro, aparece "No bootable device".',
        'El puerto de carga USB-C está dañado y no carga el equipo.',
        'La placa base tiene condensadores inflados o dañados.',
        'El lector de huellas no detecta el dedo correctamente.',
    ],
    software: [
        'El sistema operativo inicia pero se congela al cabo de 5 minutos.',
        'La computadora es muy lenta, demora 10 minutos en iniciar.',
        'El sistema no inicia, muestra pantalla azul con diferentes errores.',
        'El Wi-Fi no funciona, no detecta redes disponibles.',
        'Los programas se cierran solos sin previo aviso.',
        'El sistema operativo no se actualiza correctamente.',
        'Aparecen ventanas emergentes y publicidad constante en el navegador.',
        'El audio no funciona, los parlantes no emiten sonido.',
        'La cámara web muestra imagen borrosa o no funciona.',
        'El micrófono no funciona en videollamadas.',
        'El sistema operativo muestra "No bootable device" al iniciar.',
        'El disco duro está lleno y no permite instalar programas.',
        'Los controladores de video no funcionan correctamente.',
        'El sistema operativo tiene archivos corruptos.',
        'La red WiFi se desconecta constantemente.',
    ],
    security: [
        'La computadora está infectada con virus que afectan el rendimiento.',
        'El navegador tiene extensiones maliciosas no autorizadas.',
        'El equipo presenta ransomware que bloquea archivos importantes.',
        'El antivirus no se actualiza y el sistema está desprotegido.',
        'Aparecen programas no deseados que se instalan solos.',
        'El sistema está lento por presencia de malware.',
        'El equipo ha sido infectado y muestra anuncios constantes.',
        'El sistema de seguridad está comprometido.',
        'El usuario no puede acceder a sus archivos por bloqueo de ransomware.',
        'El sistema tiene troyanos bancarios detectados.',
    ],
    'data-recovery': [
        'El cliente necesita recuperar fotos y documentos eliminados accidentalmente.',
        'El disco duro falló y se necesita recuperar información importante.',
        'El sistema fue formateado y se perdieron archivos críticos.',
        'El cliente eliminó archivos importantes por error.',
        'El disco duro tiene sectores dañados y se necesita recuperar datos.',
        'Se necesita recuperar información de una unidad USB dañada.',
        'El cliente formateó su disco por error y necesita recuperar archivos.',
        'El sistema operativo falló y se necesita recuperar datos.',
        'Se necesita migrar datos a una nueva unidad.',
        'El cliente perdió documentos importantes por un virus.',
    ],
    maintenance: [
        'El equipo tiene mucho polvo acumulado y se sobrecalienta.',
        'La laptop necesita limpieza interna y cambio de pasta térmica.',
        'El sistema está lento y necesita optimización de rendimiento.',
        'El ventilador hace ruido y necesita mantenimiento.',
        'El equipo nunca ha tenido mantenimiento preventivo.',
        'La computadora se calienta mucho y necesita limpieza.',
        'El sistema necesita optimización para juegos.',
        'La laptop tiene temperatura alta y necesita mantenimiento térmico.',
        'El equipo necesita actualización de controladores.',
        'El sistema operativo necesita optimización de inicio.',
    ],
    network: [
        'El cliente no tiene conexión a internet en su computadora.',
        'La red Wi-Fi no funciona correctamente.',
        'El router necesita configuración básica.',
        'La impresora no se conecta a la red.',
        'El cliente necesita configurar su red local.',
        'El internet es muy lento y se necesita diagnóstico.',
        'El cliente no puede compartir archivos en la red local.',
        'El router no distribuye IP automáticamente.',
        'La red WiFi se desconecta intermitentemente.',
        'El cliente necesita configurar una VPN.',
    ],
    peripherals: [
        'La impresora no imprime correctamente.',
        'El escáner no funciona.',
        'El proyector no se conecta al equipo.',
        'La impresora tiene atascos de papel constantes.',
        'El cliente necesita instalar una impresora nueva.',
        'La impresora no tiene los drivers instalados.',
        'El equipo no reconoce la impresora USB.',
        'La impresora imprime con rayas o mala calidad.',
    ],
};

// Marcas y modelos comunes
const BRANDS = ['HP', 'Dell', 'Lenovo', 'ASUS', 'Acer', 'Apple', 'Samsung', 'MSI', 'Toshiba', 'Sony'];
const MODELS_BY_BRAND: Record<string, string[]> = {
    HP: ['Pavilion 15', 'Pavilion 14', 'Spectre x360', 'Envy x360', 'EliteBook', 'ProBook', 'Omen', 'Victus'],
    Dell: ['OptiPlex', 'Latitude', 'XPS 15', 'XPS 13', 'Inspiron 15', 'Precision', 'Alienware'],
    Lenovo: ['ThinkPad E15', 'ThinkPad T14', 'IdeaCentre', 'Legion 5', 'Legion 7', 'Yoga', 'IdeaPad'],
    ASUS: ['TUF Gaming A15', 'ROG Strix G15', 'ZenBook', 'VivoBook', 'Zephyrus', 'ProArt'],
    Acer: ['Aspire 5', 'Predator Helios 300', 'Swift', 'Nitro', 'TravelMate', 'Aspire 3'],
    Apple: ['MacBook Air M1', 'MacBook Air M2', 'MacBook Pro 13', 'MacBook Pro 14', 'Mac mini', 'iMac'],
    Samsung: ['Galaxy Book Pro', 'Galaxy Book 2 Pro', 'Galaxy Book 3', 'Galaxy Book 4'],
    MSI: ['Modern 14', 'GF63', 'GS66', 'GP66', 'GT77', 'Stealth'],
    Toshiba: ['Satellite', 'Portege', 'Tecra', 'Dynabook'],
    Sony: ['VAIO S', 'VAIO Z', 'VAIO E', 'VAIO Pro'],
};

// Procesadores comunes
const PROCESSORS = [
    'Intel Core i3-10100',
    'Intel Core i3-1115G4',
    'Intel Core i5-10210U',
    'Intel Core i5-1135G7',
    'Intel Core i5-1145G7',
    'Intel Core i5-1165G7',
    'Intel Core i5-1235U',
    'Intel Core i7-10510U',
    'Intel Core i7-1065G7',
    'Intel Core i7-10750H',
    'Intel Core i7-1165G7',
    'Intel Core i7-11800H',
    'Intel Core i7-1260P',
    'Intel Core i7-1360P',
    'AMD Ryzen 3 3200U',
    'AMD Ryzen 3 5300U',
    'AMD Ryzen 5 4600H',
    'AMD Ryzen 5 5500U',
    'AMD Ryzen 5 5600H',
    'AMD Ryzen 7 5700U',
    'AMD Ryzen 7 5800H',
    'AMD Ryzen 7 6800U',
    'AMD Ryzen 9 5900HX',
    'Apple M1',
    'Apple M2',
    'Apple M3',
];

// RAM y almacenamiento
const RAM_OPTIONS = ['4GB DDR4', '8GB DDR4', '8GB LPDDR4x', '16GB DDR4', '16GB LPDDR4x', '16GB LPDDR5', '32GB DDR4', '32GB DDR5'];
const STORAGE_OPTIONS = ['128GB SSD', '256GB SSD', '512GB SSD', '1TB HDD', '1TB SSD', '2TB HDD', '2TB SSD', '4TB HDD'];

// Sistemas operativos
const OS_OPTIONS = ['Windows 10 Home', 'Windows 10 Pro', 'Windows 11 Home', 'Windows 11 Pro', 'macOS Ventura', 'macOS Sonoma', 'Ubuntu 22.04', 'Ubuntu 24.04', 'Linux Mint', 'Debian'];

// Tipos de equipo
const TYPES = ['Desktop', 'Laptop', 'All-in-One'];

// Lista de técnicos disponibles (nombres de ejemplo)
const TECHNICIANS = [
    { id: 'tec-001', name: 'Juan Pérez' },
    { id: 'tec-002', name: 'Carlos López' },
    { id: 'tec-003', name: 'Ana Martínez' },
];

// =============================================================
// COMPONENTE PRINCIPAL
// =============================================================

interface ServiceFormProps {
    initialData?: ServiceFormValues;
    serviceId?: string;
    mode?: 'create' | 'edit';
}

export function ServiceForm({
    initialData,
    serviceId,
    mode = 'create',
}: ServiceFormProps) {
    const router = useRouter();

    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showClientSearch, setShowClientSearch] = useState(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [selectedTechnicianId, setSelectedTechnicianId] = useState<string>('');
    const [selectedTechnicianName, setSelectedTechnicianName] = useState<string>('');

    const [costBreakdown, setCostBreakdown] = useState<CostBreakdown>({
        labor: 0,
        parts: 0,
        materials: 0,
        travel: 0,
        total: 0,
    });

    const [customerApproved, setCustomerApproved] = useState(false);
    const [originalService, setOriginalService] = useState<Service | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedServiceType, setSelectedServiceType] = useState<string>('');
    const [isGenerating, setIsGenerating] = useState(false);

    const form = useForm<ServiceFormValues>({
        resolver: zodResolver(serviceSchema),
        defaultValues: initialData || {
            clientId: '',
            clientName: '',
            computer: {
                brand: '',
                model: '',
                type: 'Desktop',
                processor: '',
                ram: '',
                storage: '',
                graphics: '',
                operatingSystem: '',
                observations: '',
            },
            issue: '',
            estimatedDelivery: '',
            technician: '',
            cost: 0,
            costBreakdown: {
                labor: 0,
                parts: 0,
                materials: 0,
            },
            serviceType: '',
            serviceTypeName: '',
        },
    });

    const issueValue = form.watch('issue');

    // =========================================================
    // GENERAR SERVICIO ALEATORIO
    // =========================================================
    const generateRandomService = () => {
        setIsGenerating(true);

        try {
            // 1. Seleccionar cliente aleatorio
            const allClients = getClients();
            if (allClients.length === 0) {
                toast.add({
                    title: 'No hay clientes',
                    description: 'Primero debes crear al menos un cliente.',
                    type: 'error',
                });
                setIsGenerating(false);
                return;
            }

            const randomClient = allClients[Math.floor(Math.random() * allClients.length)];
            setSelectedClient(randomClient);
            form.setValue('clientId', randomClient.id);
            form.setValue('clientName', randomClient.name);

            // 2. Seleccionar tipo de servicio aleatorio
            const allServices = SERVICE_CATALOG;
            const randomService = allServices[Math.floor(Math.random() * allServices.length)];
            setSelectedServiceType(randomService.id);
            form.setValue('serviceType', randomService.id);
            form.setValue('serviceTypeName', randomService.name);

            // 3. Generar problema según categoría del servicio
            const category = randomService.category;
            const problems = PROBLEMS_BY_CATEGORY[category] || PROBLEMS_BY_CATEGORY.hardware;
            const randomProblem = problems[Math.floor(Math.random() * problems.length)];
            form.setValue('issue', randomProblem);

            // 4. Seleccionar equipo aleatorio
            const randomBrand = BRANDS[Math.floor(Math.random() * BRANDS.length)];
            const models = MODELS_BY_BRAND[randomBrand] || ['Modelo Genérico'];
            const randomModel = models[Math.floor(Math.random() * models.length)];
            const randomType = TYPES[Math.floor(Math.random() * TYPES.length)];
            const randomProcessor = PROCESSORS[Math.floor(Math.random() * PROCESSORS.length)];
            const randomRam = RAM_OPTIONS[Math.floor(Math.random() * RAM_OPTIONS.length)];
            const randomStorage = STORAGE_OPTIONS[Math.floor(Math.random() * STORAGE_OPTIONS.length)];
            const randomOS = OS_OPTIONS[Math.floor(Math.random() * OS_OPTIONS.length)];

            form.setValue('computer', {
                brand: randomBrand,
                model: randomModel,
                type: randomType as 'Desktop' | 'Laptop' | 'All-in-One',
                processor: randomProcessor,
                ram: randomRam,
                storage: randomStorage,
                graphics: Math.random() > 0.5 ? `NVIDIA GeForce ${Math.floor(Math.random() * 10 + 10)}${Math.random() > 0.5 ? ' Ti' : ''}` : 'Intel UHD Graphics',
                operatingSystem: randomOS,
                observations: Math.random() > 0.6 ? `Equipo con ${Math.random() > 0.5 ? 'golpes en la carcasa' : 'desgaste por uso'}` : '',
            });

            // 5. Seleccionar técnico aleatorio
            const randomTech = TECHNICIANS[Math.floor(Math.random() * TECHNICIANS.length)];
            setSelectedTechnicianId(randomTech.id);
            setSelectedTechnicianName(randomTech.name);
            form.setValue('technician', randomTech.id);
            form.setValue('technicianName', randomTech.name);

            // 6. Fecha de entrega estimada (3-7 días desde hoy)
            const deliveryDate = new Date();
            deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 5) + 3);
            form.setValue('estimatedDelivery', deliveryDate.toISOString().split('T')[0]);

            // 7. Costo basado en el servicio seleccionado
            const basePrice = randomService.basePrice;
            const travel = Math.random() > 0.6 ? 25 : 0;
            const parts = Math.floor(Math.random() * 60) + 10;
            const materials = Math.floor(Math.random() * 20) + 5;
            const labor = basePrice * 0.7;

            const newCostBreakdown: CostBreakdown = {
                labor: Math.round(labor / 5) * 5,
                parts: Math.round(parts / 5) * 5,
                materials: Math.round(materials / 5) * 5,
                travel: travel,
                total: Math.round((labor + parts + materials + travel) / 5) * 5,
            };
            setCostBreakdown(newCostBreakdown);

            // 8. Aprobación automática
            setCustomerApproved(true);

            // 9. Toast de éxito
            toast.add({
                title: '✨ Servicio generado',
                description: `Se ha generado un servicio aleatorio para ${randomClient.name}`,
                type: 'success'
            });

        } catch (error) {
            console.error('Error generando servicio:', error);
            toast.add({
                title: 'Error',
                description: 'No se pudo generar el servicio aleatorio',
                type: 'error'
            });
        } finally {
            setIsGenerating(false);
        }
    };

    // =========================================================
    // Cargar clientes y datos del servicio
    // =========================================================
    useEffect(() => {
        const allClients = getClients();
        setClients(allClients);

        if (mode === 'edit' && serviceId) {
            const service = getService(serviceId);
            if (service) {
                setOriginalService(service);
                if (service.serviceType) {
                    setSelectedServiceType(service.serviceType);
                    form.setValue('serviceType', service.serviceType);
                    form.setValue('serviceTypeName', service.serviceTypeName || '');
                }
                if (service.costBreakdown) {
                    setCostBreakdown({
                        labor: service.costBreakdown.labor || 0,
                        parts: service.costBreakdown.parts || 0,
                        materials: service.costBreakdown.materials || 0,
                        travel: service.costBreakdown.travel || 0,
                        total: service.costBreakdown.total || service.cost || 0,
                    });
                }
                if (service.customerApproved) {
                    setCustomerApproved(true);
                }
                const client = allClients.find((c) => c.id === service.clientId);
                if (client) {
                    setSelectedClient(client);
                    form.setValue('clientName', client.name);
                }
                if (service.technician) {
                    setSelectedTechnicianId(service.technician);
                    setSelectedTechnicianName(service.technicianName || '');
                    form.setValue('technician', service.technician);
                }
            }
        }

        if (initialData?.clientId) {
            const client = allClients.find((c) => c.id === initialData.clientId);
            if (client) {
                setSelectedClient(client);
                form.setValue('clientName', client.name);
            }
        }

        if (initialData?.serviceType) {
            setSelectedServiceType(initialData.serviceType);
        }
    }, [initialData, form, mode, serviceId]);

    // =========================================================
    // Actualizar costo total
    // =========================================================
    useEffect(() => {
        form.setValue('cost', costBreakdown.total);
    }, [costBreakdown, form]);

    // =========================================================
    // Filtrar clientes
    // =========================================================
    const filteredClients = clients.filter(
        (client) =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.includes(searchTerm) ||
            client.documentNumber.includes(searchTerm)
    );

    // =========================================================
    // Seleccionar cliente
    // =========================================================
    const handleSelectClient = (client: Client) => {
        setSelectedClient(client);
        form.setValue('clientId', client.id);
        form.setValue('clientName', client.name);
        setShowClientSearch(false);
        setSearchTerm('');
        toast.add({
            title: 'Cliente seleccionado',
            description: `${client.name} ha sido seleccionado`,
            type: 'success'
        });
    };

    // =========================================================
    // Manejar cambio de tipo de servicio
    // =========================================================
    const handleServiceTypeChange = (serviceTypeId: string) => {
        setSelectedServiceType(serviceTypeId);
        form.setValue('serviceType', serviceTypeId);
        const foundService = SERVICE_CATALOG.find((service) => service.id === serviceTypeId);
        if (foundService) {
            form.setValue('serviceTypeName', foundService.name);
        } else {
            form.setValue('serviceTypeName', '');
        }
    };

    // =========================================================
    // Cambio de costos
    // =========================================================
    const handleCostChange = (breakdown: CostBreakdown) => {
        setCostBreakdown(breakdown);
        if (customerApproved && originalService) {
            const originalTotal = originalService.costBreakdown?.total || originalService.cost || 0;
            if (breakdown.total !== originalTotal) {
                toast.add({
                    title: 'Costo modificado',
                    description: 'El costo ha cambiado. El cliente deberá aprobar el nuevo presupuesto.',
                    type: 'success'
                });
            }
        }
    };

    // =========================================================
    // Etiqueta del estado
    // =========================================================
    const getStatusLabel = (status: Service['status']) => {
        const labels = {
            pending: 'Pendiente',
            'in-progress': 'En Proceso',
            completed: 'Completado',
            delivered: 'Entregado',
        };
        return labels[status] || status;
    };

    // Función para manejar cambio de técnico
    const handleTechnicianChange = (technicianId: string, technicianName: string) => {
        setSelectedTechnicianId(technicianId);
        setSelectedTechnicianName(technicianName);
        form.setValue('technician', technicianId);
        form.setValue('technicianName', technicianName);
    };

    // =========================================================
    // GUARDAR SERVICIO
    // =========================================================
    const onSubmit = async (data: ServiceFormValues) => {
        if (!customerApproved) {
            toast.add({
                title: 'Presupuesto no aprobado',
                description: 'El cliente debe aprobar el presupuesto antes de crear o actualizar el servicio',
                type: 'error'
            });
            return;
        }

        if (!selectedServiceType) {
            toast.add({
                title: 'Tipo de servicio requerido',
                description: 'Debes seleccionar un tipo de servicio antes de continuar.',
                type: 'error'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const now = new Date().toISOString();
            const serviceTypeName = SERVICE_CATALOG.find(
                (service) => service.id === selectedServiceType
            )?.name || '';

            if (mode === 'create') {
                const newService: Service = {
                    ...data,
                    id: generateId('srvc'),
                    status: 'pending',
                    entryDate: now,
                    createdAt: now,
                    updatedAt: now,
                    ticketNumber: generateTicketNumber(),
                    clientId: data.clientId,
                    deliveredDate: undefined,
                    diagnosis: '',
                    repairDetails: '',
                    costBreakdown: costBreakdown,
                    cost: costBreakdown.total,
                    estimatedCost: costBreakdown.total,
                    customerApproved: true,
                    approvalDate: now,
                    serviceType: selectedServiceType,
                    serviceTypeName: serviceTypeName,
                    statusHistory: [
                        {
                            status: 'pending',
                            date: now,
                            note: serviceTypeName
                                ? `Servicio creado con presupuesto aprobado - ${serviceTypeName}`
                                : 'Servicio creado con presupuesto aprobado',
                        },
                    ],
                };
                saveService(newService);
                toast.add({
                    title: 'Servicio creado',
                    description: `Ticket ${newService.ticketNumber} creado exitosamente`,
                    type: 'success'
                });
            } else if (mode === 'edit' && serviceId) {
                const existingService = getService(serviceId);
                if (!existingService) {
                    toast.add({
                        title: 'Error',
                        description: 'Servicio no encontrado',
                        type: 'error'
                    });
                    return;
                }

                if (existingService.status === 'completed' || existingService.status === 'delivered') {
                    toast.add({
                        title: 'Error',
                        description: 'No se puede editar un servicio completado o entregado',
                        type: 'error'
                    });
                    return;
                }

                const historyNotes: string[] = [];
                const existingTotal = existingService.costBreakdown?.total || existingService.cost || 0;
                if (existingTotal !== costBreakdown.total) {
                    historyNotes.push(
                        `Costo actualizado: ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(existingTotal)} → ${new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(costBreakdown.total)}`
                    );
                }
                if (existingService.technician !== data.technician) {
                    historyNotes.push(`Técnico: ${existingService.technician} → ${data.technician}`);
                }
                if (existingService.estimatedDelivery !== data.estimatedDelivery) {
                    historyNotes.push(`Entrega estimada: ${existingService.estimatedDelivery} → ${data.estimatedDelivery}`);
                }
                if (existingService.serviceType !== selectedServiceType) {
                    const oldServiceName = existingService.serviceTypeName ||
                        SERVICE_CATALOG.find((service) => service.id === existingService.serviceType)?.name ||
                        'No definido';
                    historyNotes.push(`Tipo de servicio: ${oldServiceName} → ${serviceTypeName || 'No definido'}`);
                }

                const updatedService: Service = {
                    ...existingService,
                    ...data,
                    computer: data.computer,
                    issue: data.issue,
                    estimatedDelivery: data.estimatedDelivery,
                    technician: data.technician,
                    costBreakdown: costBreakdown,
                    cost: costBreakdown.total,
                    estimatedCost: costBreakdown.total,
                    customerApproved: true,
                    approvalDate: now,
                    updatedAt: now,
                    serviceType: selectedServiceType,
                    serviceTypeName: serviceTypeName,
                    statusHistory: [
                        ...(existingService.statusHistory || []),
                        {
                            status: existingService.status,
                            date: now,
                            note: historyNotes.length > 0
                                ? `Edición: ${historyNotes.join('; ')}`
                                : 'Edición general del servicio',
                        },
                    ],
                };
                saveService(updatedService);
                toast.add({
                    title: 'Servicio actualizado',
                    description: `Ticket ${updatedService.ticketNumber} actualizado exitosamente`,
                    type: 'success'
                });
            }

            router.push('/services');
        } catch (error) {
            console.error('Error guardando servicio:', error);
            toast.add({
                title: 'Error',
                description: 'No se pudo guardar el servicio',
                type: 'error'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // =========================================================
    // BLOQUEAR SERVICIOS COMPLETADOS / ENTREGADOS
    // =========================================================
    const isBlocked = mode === 'edit' && originalService &&
        (originalService.status === 'completed' || originalService.status === 'delivered');

    if (isBlocked) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Servicio bloqueado</AlertTitle>
                <AlertDescription>
                    Este servicio está en estado <strong>{getStatusLabel(originalService.status)}</strong> y no puede ser editado.
                </AlertDescription>
            </Alert>
        );
    }

    // =========================================================
    // FORMULARIO
    // =========================================================
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* =================================================
                    HISTORIAL
                ================================================= */}
                {mode === 'edit' && originalService && originalService.statusHistory && (
                    <Accordion type="single" className="border rounded-lg">
                        <AccordionItem value="history">
                            <AccordionTrigger className="px-4 hover:no-underline">
                                <div className="flex items-center gap-2">
                                    <History className="h-4 w-4 text-gray-500" />
                                    <span className="text-sm font-medium">Historial de cambios</span>
                                    <Badge variant="outline" className="ml-2">
                                        {originalService.statusHistory.length} cambios
                                    </Badge>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                                <div className="space-y-2">
                                    {originalService.statusHistory.map((entry, index) => (
                                        <div key={index} className="text-sm border-l-2 border-gray-200 pl-3 py-1">
                                            <div className="flex items-center gap-2">
                                                <Badge className={getStatusColor(entry.status)}>
                                                    {getStatusLabel(entry.status)}
                                                </Badge>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(entry.date).toLocaleString('es-ES', {
                                                        day: '2-digit',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                            {entry.note && <p className="text-gray-600 mt-1">{entry.note}</p>}
                                        </div>
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                )}

                {/* =================================================
                    CLIENTE + EQUIPO
                ================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* =================================================
                        CLIENTE
                    ================================================= */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">
                                    Información del Cliente
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="clientId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Buscar Cliente</FormLabel>
                                        <div className="flex gap-2">
                                            <div className="flex-1 relative">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    className="w-full justify-start text-left font-normal"
                                                    onClick={() => setShowClientSearch(!showClientSearch)}
                                                >
                                                    <Search className="h-4 w-4 mr-2 text-gray-500" />
                                                    {selectedClient ? selectedClient.name : 'Buscar cliente...'}
                                                </Button>
                                                {showClientSearch && (
                                                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                                                        <div className="p-2">
                                                            <Input
                                                                placeholder="Escribe nombre, teléfono o documento..."
                                                                value={searchTerm}
                                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                                className="mb-2"
                                                                autoFocus
                                                            />
                                                            {filteredClients.length === 0 ? (
                                                                <p className="text-sm text-gray-500 p-2 text-center">
                                                                    No se encontraron clientes
                                                                </p>
                                                            ) : (
                                                                filteredClients.map((client) => (
                                                                    <button
                                                                        key={client.id}
                                                                        type="button"
                                                                        className="w-full text-left p-2 hover:bg-gray-100 rounded-md transition-colors"
                                                                        onClick={() => handleSelectClient(client)}
                                                                    >
                                                                        <p className="font-medium">{client.name}</p>
                                                                        <p className="text-sm text-gray-500">
                                                                            {client.phone} • {client.documentType}: {client.documentNumber}
                                                                        </p>
                                                                    </button>
                                                                ))
                                                            )}
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                className="w-full mt-2 text-blue-600"
                                                                onClick={() => router.push('/clients/new')}
                                                            >
                                                                <UserPlus className="h-4 w-4 mr-2" />
                                                                Crear nuevo cliente
                                                            </Button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="clientName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nombre del Cliente</FormLabel>
                                        <FormControl>
                                            <Input {...field} readOnly className="bg-gray-50" />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    {/* =================================================
                        EQUIPO
                    ================================================= */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold">
                                Información del Equipo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="computer.brand"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Marca</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="HP, Dell, Lenovo..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="computer.model"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Modelo</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Pavilion 15, OptiPlex..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="computer.type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tipo de Equipo</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecciona el tipo" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Desktop">Desktop</SelectItem>
                                                <SelectItem value="Laptop">Laptop</SelectItem>
                                                <SelectItem value="All-in-One">All-in-One</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="computer.processor"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Procesador</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="Intel i5, Ryzen 7..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="computer.ram"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>RAM</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="8GB, 16GB..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="computer.storage"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Almacenamiento</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="256GB SSD, 1TB HDD..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="computer.graphics"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gráficos (Opcional)</FormLabel>
                                            <FormControl>
                                                <Input {...field} placeholder="NVIDIA GTX, Intel Iris..." />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="computer.operatingSystem"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sistema Operativo</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="Windows 11, macOS Ventura..." />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="computer.observations"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Observaciones del Equipo</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Estado físico, detalles adicionales..."
                                                rows={2}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* =================================================
                    SERVICIO + COSTOS
                ================================================= */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* =================================================
                        DETALLES DEL SERVICIO
                    ================================================= */}
                    <Card className="border-none shadow-sm">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">
                                    Detalles del Servicio
                                </CardTitle>
                                {/* ✅ BOTÓN GENERAR ALEATORIO */}
                                {mode === 'create' && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                                        onClick={generateRandomService}
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <span className="animate-spin">⟳</span>
                                                Generando...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Generar Aleatorio
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="issue"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Descripción del Problema</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                {...field}
                                                placeholder="Describe detalladamente el problema que presenta el equipo..."
                                                rows={4}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-1 gap-4">
                                <FormField
                                    control={form.control}
                                    name="technician"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Técnico Responsable</FormLabel>
                                            <FormControl>
                                                <TechnicianSelector
                                                    value={selectedTechnicianId || field.value}
                                                    onChange={handleTechnicianChange}
                                                    disabled={mode === 'edit' && originalService?.status === 'completed' || originalService?.status === 'delivered'}
                                                    showAddTechnician={true}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="estimatedDelivery"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Fecha Estimada de Entrega</FormLabel>
                                            <FormControl>
                                                <Input {...field} type="date" />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* =================================================
                        CALCULADORA
                    ================================================= */}
                    <div className="space-y-4">
                        <CostCalculator
                            onCostChange={handleCostChange}
                            initialCost={costBreakdown}
                            issueDescription={issueValue}
                            onServiceTypeChange={handleServiceTypeChange}
                            selectedServiceType={selectedServiceType}
                        />

                        {/* =================================================
                            APROBACIÓN DEL CLIENTE
                        ================================================= */}
                        <Card
                            className={cn(
                                'border shadow-sm',
                                customerApproved
                                    ? 'border-green-200 bg-green-50/50'
                                    : 'border-yellow-200 bg-yellow-50/50'
                            )}
                        >
                            <CardContent className="pt-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        <input
                                            type="checkbox"
                                            id="customerApproved"
                                            checked={customerApproved}
                                            onChange={(e) => setCustomerApproved(e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="customerApproved" className="font-medium cursor-pointer">
                                            {customerApproved
                                                ? '✅ Cliente aprueba el presupuesto'
                                                : 'Cliente aprueba el presupuesto'}
                                        </label>
                                        <p className="text-sm text-gray-500">
                                            Confirmar que el cliente ha aceptado el presupuesto detallado.
                                        </p>
                                        {costBreakdown.total > 0 && customerApproved && (
                                            <Badge className="mt-2 bg-green-100 text-green-700 border-green-200">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Presupuesto aprobado por{' '}
                                                {new Intl.NumberFormat('es-PE', {
                                                    style: 'currency',
                                                    currency: 'PEN',
                                                }).format(costBreakdown.total)}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* =================================================
                    BOTONES
                ================================================= */}
                <div className="flex justify-end gap-4 pt-4 border-t">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/services')}
                    >
                        Cancelar
                    </Button>

                    <Button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={
                            !customerApproved ||
                            !selectedServiceType ||
                            costBreakdown.total === 0 ||
                            isSubmitting
                        }
                    >
                        {isSubmitting ? (
                            <>Guardando...</>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                {mode === 'create' ? 'Crear Servicio' : 'Actualizar Servicio'}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
}

// =============================================================
// Colores de estado
// =============================================================
function getStatusColor(status: Service['status']) {
    const colors = {
        pending: 'bg-yellow-100 text-yellow-800',
        'in-progress': 'bg-blue-100 text-blue-800',
        completed: 'bg-green-100 text-green-800',
        delivered: 'bg-purple-100 text-purple-800',
    };
    return colors[status] || colors.pending;
}