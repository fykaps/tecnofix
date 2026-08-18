import { ServiceCatalog } from '@/types/service.types';

// Catálogo de servicios con precios base
export const SERVICE_CATALOG: ServiceCatalog[] = [
    {
        id: 'svc-001',
        name: 'Diagnóstico General',
        description: 'Revisión completa del equipo, detección de problemas de hardware y software',
        basePrice: 30.00,
        laborHours: 1,
        category: 'diagnostic',
        includesTravel: false,
    },
    {
        id: 'svc-002',
        name: 'Formateo e Instalación de Sistema Operativo',
        description: 'Formateo completo, instalación de Windows/Linux y drivers básicos',
        basePrice: 80.00,
        laborHours: 2,
        category: 'software',
        includesTravel: false,
    },
    {
        id: 'svc-003',
        name: 'Instalación de Software y Programas',
        description: 'Instalación de paquetes de Office, Adobe, antivirus y programas solicitados',
        basePrice: 40.00,
        laborHours: 1,
        category: 'software',
        includesTravel: false,
    },
    {
        id: 'svc-004',
        name: 'Eliminación de Virus y Malware',
        description: 'Análisis profundo, eliminación de virus, troyanos y software malicioso',
        basePrice: 60.00,
        laborHours: 1.5,
        category: 'software',
        includesTravel: false,
    },
    {
        id: 'svc-005',
        name: 'Limpieza Física y Mantenimiento Preventivo',
        description: 'Limpieza de polvo, cambio de pasta térmica, optimización del sistema',
        basePrice: 70.00,
        laborHours: 1.5,
        category: 'maintenance',
        includesTravel: false,
    },
    {
        id: 'svc-006',
        name: 'Reparación de Hardware (Fuente de Poder)',
        description: 'Diagnóstico y reparación de fuente de poder',
        basePrice: 120.00,
        laborHours: 2,
        category: 'hardware',
        includesTravel: false,
    },
    {
        id: 'svc-007',
        name: 'Reparación de Hardware (Placa Base)',
        description: 'Diagnóstico y reparación de placa base',
        basePrice: 200.00,
        laborHours: 3,
        category: 'hardware',
        includesTravel: false,
    },
    {
        id: 'svc-008',
        name: 'Reemplazo de Disco Duro/SSD',
        description: 'Instalación de nuevo disco, migración de datos y sistema operativo',
        basePrice: 100.00,
        laborHours: 2,
        category: 'hardware',
        includesTravel: false,
    },
    {
        id: 'svc-009',
        name: 'Instalación de Memoria RAM',
        description: 'Instalación de módulos de memoria RAM',
        basePrice: 40.00,
        laborHours: 0.5,
        category: 'hardware',
        includesTravel: false,
    },
    {
        id: 'svc-010',
        name: 'Configuración de Red y Wi-Fi',
        description: 'Configuración de router, red local, impresoras en red',
        basePrice: 50.00,
        laborHours: 1,
        category: 'network',
        includesTravel: false,
    },
    {
        id: 'svc-011',
        name: 'Recuperación de Datos',
        description: 'Recuperación de archivos borrados o de discos dañados',
        basePrice: 150.00,
        laborHours: 3,
        category: 'hardware',
        includesTravel: false,
    },
    {
        id: 'svc-012',
        name: 'Servicio a Domicilio (Adicional)',
        description: 'Traslado del técnico al domicilio del cliente',
        basePrice: 25.00,
        laborHours: 0.5,
        category: 'maintenance',
        includesTravel: true,
    },
];

// Obtener precio base por categoría o nombre
export const getBasePriceByService = (serviceName: string): number => {
    const found = SERVICE_CATALOG.find(s =>
        serviceName.toLowerCase().includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(serviceName.toLowerCase())
    );
    return found?.basePrice || 50.00; // Precio por defecto
};

// Calcular costo total con desglose
export const calculateCostBreakdown = (params: {
    serviceType: string;
    includesTravel: boolean;
    partsCost?: number;
    materialsCost?: number;
    hoursWorked?: number;
}): CostBreakdown => {
    const baseService = SERVICE_CATALOG.find(s =>
        params.serviceType.toLowerCase().includes(s.name.toLowerCase()) ||
        s.name.toLowerCase().includes(params.serviceType.toLowerCase())
    );

    const baseCost = baseService?.basePrice || 50.00;
    const hourlyRate = 50.00; // Tarifa por hora adicional
    const hours = params.hoursWorked || baseService?.laborHours || 1;

    const labor = hourlyRate * hours;
    const parts = params.partsCost || 0;
    const materials = params.materialsCost || 0;
    const travel = params.includesTravel ? 25.00 : 0;

    return {
        labor,
        parts,
        materials,
        travel,
        total: labor + parts + materials + travel,
    };
};