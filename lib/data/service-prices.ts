import { ServiceCatalog } from '@/types/service.types';

/**
 * CATÁLOGO DE SERVICIOS TÉCNICOS TECNOFIX
 * 
 * Precios ajustados a la realidad económica de Puno y zona rural
 * Competencia: S/ 20-30 diagnóstico, S/ 40-60 formateo
 * 
 * Estrategia: Precios competitivos + valor agregado (transparencia, educación, garantía)
 * 
 * Actualizado: Agosto 2026
 * Versión: 2.0 - Precios Realistas
 */

export const SERVICE_CATALOG: ServiceCatalog[] = [

    // ================================================================
    // 🔍 DIAGNÓSTICO Y EVALUACIÓN TÉCNICA
    // ================================================================

    {
        id: 'svc-001',
        name: 'Diagnóstico General de Equipo',
        description: 'Evaluación completa: pruebas de hardware, software, temperatura y rendimiento. Identificación de fallas y recomendaciones.',
        basePrice: 25.00,
        laborHours: 1,
        category: 'diagnostic',
        includesTravel: false,
    },

    {
        id: 'svc-002',
        name: 'Diagnóstico de Placa Base y Componentes',
        description: 'Evaluación electrónica de motherboard, condensadores, VRM, puertos y conectores. Detección de cortos y fallas.',
        basePrice: 40.00,
        laborHours: 1.5,
        category: 'diagnostic',
        includesTravel: false,
    },

    {
        id: 'svc-003',
        name: 'Diagnóstico de Almacenamiento y Datos',
        description: 'Análisis SMART de discos duros y SSD. Detección de sectores defectuosos y evaluación de vida útil.',
        basePrice: 25.00,
        laborHours: 1,
        category: 'diagnostic',
        includesTravel: false,
    },

    // ================================================================
    // 💻 SISTEMAS OPERATIVOS Y SOFTWARE
    // ================================================================

    {
        id: 'svc-004',
        name: 'Formateo e Instalación de Windows 10/11',
        description: 'Formateo completo, instalación de Windows, controladores básicos, actualizaciones y configuraciones iniciales.',
        basePrice: 50.00,
        laborHours: 2,
        category: 'software',
        includesTravel: false,
    },

    {
        id: 'svc-005',
        name: 'Reinstalación de Sistema Operativo (Conservando Datos)',
        description: 'Reinstalación del sistema manteniendo archivos personales cuando sea técnicamente posible.',
        basePrice: 55.00,
        laborHours: 2,
        category: 'software',
        includesTravel: false,
    },

    {
        id: 'svc-006',
        name: 'Reparación de Sistema Operativo',
        description: 'Corrección de errores de arranque, pantallas azules, archivos dañados y servicios del sistema.',
        basePrice: 45.00,
        laborHours: 1.5,
        category: 'software',
        includesTravel: false,
    },

    {
        id: 'svc-007',
        name: 'Instalación de Software y Programas',
        description: 'Instalación de programas de oficina, navegadores, lectores PDF, compresores y utilidades básicas.',
        basePrice: 30.00,
        laborHours: 1,
        category: 'software',
        includesTravel: false,
    },

    {
        id: 'svc-008',
        name: 'Instalación de Paquete Office y Herramientas de Estudio',
        description: 'Instalación de Microsoft Office, LibreOffice o herramientas educativas para estudiantes y docentes.',
        basePrice: 35.00,
        laborHours: 1,
        category: 'software',
        includesTravel: false,
    },

    // ================================================================
    // 🛡️ SEGURIDAD Y MALWARE
    // ================================================================

    {
        id: 'svc-009',
        name: 'Eliminación de Virus y Malware',
        description: 'Análisis y eliminación de virus, troyanos, spyware y programas maliciosos que afectan el rendimiento.',
        basePrice: 40.00,
        laborHours: 1.5,
        category: 'security',
        includesTravel: false,
    },

    {
        id: 'svc-010',
        name: 'Eliminación de Virus Avanzados y Ransomware',
        description: 'Eliminación de ransomware, rootkits y amenazas persistentes. Recuperación de archivos cuando sea posible.',
        basePrice: 70.00,
        laborHours: 2.5,
        category: 'security',
        includesTravel: false,
    },

    {
        id: 'svc-011',
        name: 'Instalación de Antivirus y Configuración de Seguridad',
        description: 'Instalación, configuración y actualización de antivirus. Recomendaciones de seguridad básica.',
        basePrice: 30.00,
        laborHours: 1,
        category: 'security',
        includesTravel: false,
    },

    // ================================================================
    // 💾 RECUPERACIÓN DE DATOS
    // ================================================================

    {
        id: 'svc-012',
        name: 'Recuperación de Datos Eliminados',
        description: 'Recuperación de archivos borrados accidentalmente de discos duros, USB o tarjetas de memoria.',
        basePrice: 60.00,
        laborHours: 1.5,
        category: 'data-recovery',
        includesTravel: false,
    },

    {
        id: 'svc-013',
        name: 'Recuperación de Datos Post-Formateo',
        description: 'Recuperación de información después de formateo accidental o pérdida de particiones.',
        basePrice: 90.00,
        laborHours: 2.5,
        category: 'data-recovery',
        includesTravel: false,
    },

    {
        id: 'svc-014',
        name: 'Copia de Seguridad de Datos',
        description: 'Respaldo de documentos, fotos, videos y archivos importantes a disco externo o nube.',
        basePrice: 40.00,
        laborHours: 1.5,
        category: 'data-recovery',
        includesTravel: false,
    },

    {
        id: 'svc-015',
        name: 'Clonación de Disco Duro a SSD',
        description: 'Transferencia de todo el contenido del disco antiguo a uno nuevo, manteniendo sistema y datos.',
        basePrice: 60.00,
        laborHours: 1.5,
        category: 'data-recovery',
        includesTravel: false,
    },

    // ================================================================
    // 🔧 MANTENIMIENTO
    // ================================================================

    {
        id: 'svc-016',
        name: 'Limpieza Física y Mantenimiento Preventivo',
        description: 'Limpieza interna y externa, eliminación de polvo, revisión de componentes y optimización del sistema.',
        basePrice: 45.00,
        laborHours: 1.5,
        category: 'maintenance',
        includesTravel: false,
    },

    {
        id: 'svc-017',
        name: 'Limpieza de Laptop y Cambio de Pasta Térmica',
        description: 'Limpieza profunda de ventiladores, disipadores y reemplazo de pasta térmica para mejorar temperatura.',
        basePrice: 55.00,
        laborHours: 1.5,
        category: 'maintenance',
        includesTravel: false,
    },

    {
        id: 'svc-018',
        name: 'Optimización de Rendimiento y Velocidad',
        description: 'Limpieza de archivos temporales, desfragmentación, optimización de inicio y servicios del sistema.',
        basePrice: 35.00,
        laborHours: 1,
        category: 'maintenance',
        includesTravel: false,
    },

    // ================================================================
    // 🖥️ REPARACIÓN DE HARDWARE
    // ================================================================

    {
        id: 'svc-019',
        name: 'Reparación de Fuente de Poder',
        description: 'Diagnóstico y reparación de fuente de alimentación de computadoras de escritorio.',
        basePrice: 60.00,
        laborHours: 1.5,
        category: 'hardware',
        includesTravel: false,
    },

    {
        id: 'svc-020',
        name: 'Reemplazo de Disco Duro o SSD',
        description: 'Instalación de nueva unidad de almacenamiento y configuración del sistema.',
        basePrice: 50.00,
        laborHours: 1,
        category: 'hardware',
        includesTravel: false,
    },

    {
        id: 'svc-021',
        name: 'Instalación o Ampliación de Memoria RAM',
        description: 'Instalación de módulos de memoria RAM, verificación de compatibilidad y pruebas de estabilidad.',
        basePrice: 30.00,
        laborHours: 0.5,
        category: 'hardware',
        includesTravel: false,
    },

    {
        id: 'svc-022',
        name: 'Reemplazo de Batería de Laptop',
        description: 'Diagnóstico y reemplazo de batería de laptop por una compatible.',
        basePrice: 50.00,
        laborHours: 1,
        category: 'hardware',
        includesTravel: false,
    },

    {
        id: 'svc-023',
        name: 'Reemplazo de Pantalla de Laptop',
        description: 'Sustitución de pantalla LCD/LED dañada o con líneas en laptop.',
        basePrice: 80.00,
        laborHours: 2,
        category: 'hardware',
        includesTravel: false,
    },

    {
        id: 'svc-024',
        name: 'Reemplazo de Teclado de Laptop',
        description: 'Sustitución de teclado dañado o con teclas que no funcionan.',
        basePrice: 60.00,
        laborHours: 1.5,
        category: 'hardware',
        includesTravel: false,
    },

    {
        id: 'svc-025',
        name: 'Reparación de Puertos USB y Conectores',
        description: 'Reparación o reemplazo de puertos USB, HDMI, carga o conectores dañados.',
        basePrice: 70.00,
        laborHours: 1.5,
        category: 'hardware',
        includesTravel: false,
    },

    {
        id: 'svc-026',
        name: 'Reparación de Placa Base (Básico)',
        description: 'Diagnóstico y reparación de fallas comunes en placa base: condensadores, puertos, alimentación.',
        basePrice: 100.00,
        laborHours: 2,
        category: 'hardware',
        includesTravel: false,
    },

    // ================================================================
    // 🔌 REDES Y CONECTIVIDAD
    // ================================================================

    {
        id: 'svc-027',
        name: 'Configuración de Red Wi-Fi e Internet',
        description: 'Configuración de red inalámbrica, solución de problemas de conexión a Internet.',
        basePrice: 35.00,
        laborHours: 1,
        category: 'network',
        includesTravel: false,
    },

    {
        id: 'svc-028',
        name: 'Configuración de Router y Red Local',
        description: 'Configuración de router, seguridad Wi-Fi, cambio de contraseña, optimización de señal.',
        basePrice: 40.00,
        laborHours: 1,
        category: 'network',
        includesTravel: false,
    },

    {
        id: 'svc-029',
        name: 'Diagnóstico de Problemas de Internet',
        description: 'Análisis de caídas de internet, velocidad, latencia y configuración de red.',
        basePrice: 30.00,
        laborHours: 1,
        category: 'network',
        includesTravel: false,
    },

    // ================================================================
    // 🖨️ PERIFÉRICOS Y DISPOSITIVOS
    // ================================================================

    {
        id: 'svc-030',
        name: 'Configuración de Impresora',
        description: 'Instalación y configuración de impresoras USB o en red. Solución de problemas de impresión.',
        basePrice: 35.00,
        laborHours: 1,
        category: 'peripherals',
        includesTravel: false,
    },

    {
        id: 'svc-031',
        name: 'Limpieza y Mantenimiento de Impresora',
        description: 'Limpieza de cabezales, solución de atascos, mantenimiento preventivo de impresoras.',
        basePrice: 40.00,
        laborHours: 1.5,
        category: 'peripherals',
        includesTravel: false,
    },

    // ================================================================
    // 🏠 SERVICIO A DOMICILIO
    // ================================================================

    {
        id: 'svc-032',
        name: 'Servicio Técnico a Domicilio (Básico)',
        description: 'Atención personalizada en el domicilio del cliente para diagnóstico y reparación básica.',
        basePrice: 20.00,
        laborHours: 0.5,
        category: 'support',
        includesTravel: true,
    },

    {
        id: 'svc-033',
        name: 'Servicio Técnico a Domicilio (Completo)',
        description: 'Atención presencial para diagnóstico, reparación, mantenimiento y configuración en el hogar.',
        basePrice: 30.00,
        laborHours: 1,
        category: 'support',
        includesTravel: true,
    },

    // ================================================================
    // 🎓 SERVICIOS EDUCATIVOS Y ASESORÍA (VALOR AGREGADO)
    // ================================================================

    {
        id: 'svc-034',
        name: 'Capacitación en Uso Básico de Computadora',
        description: 'Enseñanza básica para adultos y adultos mayores: encender, apagar, usar archivos, Internet básico.',
        basePrice: 30.00,
        laborHours: 1.5,
        category: 'support',
        includesTravel: false,
    },

    {
        id: 'svc-035',
        name: 'Asesoría en Compra de Computadora o Componentes',
        description: 'Recomendación personalizada según necesidad y presupuesto. Asesoría en compras seguras.',
        basePrice: 25.00,
        laborHours: 1,
        category: 'support',
        includesTravel: false,
    },

    {
        id: 'svc-036',
        name: 'Taller de Mantenimiento Básico para Usuarios',
        description: 'Capacitación práctica en limpieza, mantenimiento y cuidado básico de computadoras.',
        basePrice: 40.00,
        laborHours: 2,
        category: 'support',
        includesTravel: false,
    },

    // ================================================================
    // 🚀 SERVICIOS EMPRESARIALES (Pequenas empresas)
    // ================================================================

    {
        id: 'svc-037',
        name: 'Mantenimiento de Equipos para Negocios',
        description: 'Servicio para pequeños negocios y emprendedores. Mantenimiento de 2 a 5 equipos.',
        basePrice: 80.00,
        laborHours: 2.5,
        category: 'support',
        includesTravel: false,
    },

    {
        id: 'svc-038',
        name: 'Configuración de Red para Pequeña Oficina',
        description: 'Instalación y configuración de red local, internet, impresoras compartidas para negocios.',
        basePrice: 70.00,
        laborHours: 2,
        category: 'network',
        includesTravel: false,
    },
];

/**
 * Obtiene el nombre del servicio por ID
 */
export const getServiceName = (id: string): string => {
    const found = SERVICE_CATALOG.find(s => s.id === id);
    return found?.name || '';
};

/**
 * Obtiene el precio base por ID
 */
export const getServicePrice = (id: string): number => {
    const found = SERVICE_CATALOG.find(s => s.id === id);
    return found?.basePrice || 0;
};

/**
 * Obtiene la categoría por ID
 */
export const getServiceCategory = (id: string): string => {
    const found = SERVICE_CATALOG.find(s => s.id === id);
    return found?.category || 'general';
};

/**
 * Obtiene todos los servicios de una categoría
 */
export const getServicesByCategory = (category: string): ServiceCatalog[] => {
    return SERVICE_CATALOG.filter(s => s.category === category);
};

/**
 * Obtiene servicios por rango de precio
 */
export const getServicesByPriceRange = (min: number, max: number): ServiceCatalog[] => {
    return SERVICE_CATALOG.filter(s => s.basePrice >= min && s.basePrice <= max);
};

/**
 * Calcula el desglose de costos para un servicio
 */
export const calculateCostBreakdown = (params: {
    serviceType: string;
    includesTravel?: boolean;
    partsCost?: number;
    materialsCost?: number;
    hoursWorked?: number;
}): CostBreakdown => {
    // Buscar el servicio en el catálogo
    const service = SERVICE_CATALOG.find(s =>
        s.name.toLowerCase().includes(params.serviceType.toLowerCase()) ||
        params.serviceType.toLowerCase().includes(s.name.toLowerCase())
    );

    const hourlyRate = 30.00; // Tarifa por hora ajustada a la zona
    const hours = params.hoursWorked || service?.laborHours || 1;
    const baseLabor = hours * hourlyRate;

    // Si hay un servicio base, usar su precio como referencia
    const baseCost = service?.basePrice || 30.00;

    const labor = baseLabor;
    const parts = params.partsCost || 0;
    const materials = params.materialsCost || 0;
    const travel = params.includesTravel ? 20.00 : 0;

    return {
        labor,
        parts,
        materials,
        travel,
        total: labor + parts + materials + travel,
    };
};

import { CostBreakdown } from '@/types/service.types';