export interface ComputerSpecs {
    brand: string;
    model: string;
    type: 'Desktop' | 'Laptop' | 'All-in-One';
    processor: string;
    ram: string;
    storage: string;
    graphics?: string;
    operatingSystem: string;
    observations?: string;
}

export interface CostBreakdown {
    labor: number;          // Mano de obra
    parts: number;          // Repuestos (si aplica)
    materials: number;      // Materiales (pasta térmica, limpiadores, etc.)
    travel: number;         // Traslado/Domicilio
    total: number;          // Suma de todos los costos
}

export interface Service {
    id: string;
    clientId: string;
    clientName: string;
    computer: ComputerSpecs;
    issue: string;
    status: 'pending' | 'in-progress' | 'completed' | 'delivered';
    entryDate: string;
    estimatedDelivery: string;
    deliveredDate?: string;
    diagnosis?: string;
    repairDetails?: string;
    costBreakdown: CostBreakdown;
    technician: string;
    ticketNumber: string;
    createdAt: string;
    updatedAt: string;
    // ✅ Propiedades de costo para fácil acceso
    cost: number;                   // Total del costo (igual a costBreakdown.total)
    estimatedCost: number;          // Costo estimado inicial
    finalCost?: number;             // Costo final (puede variar si se encontraron problemas adicionales)
    customerApproved: boolean;      // Cliente aprobó el presupuesto
    approvalDate?: string;          // Fecha de aprobación
    statusHistory: Array<{          // Historial de cambios
        status: Service['status'];
        date: string;
        note?: string;
    }>;
}

export interface ServiceCatalog {
    id: string;
    name: string;
    description: string;
    basePrice: number;            // Precio base
    laborHours: number;           // Horas estimadas
    category: 'software' | 'hardware' | 'maintenance' | 'diagnostic' | 'network';
    includesTravel: boolean;      // ¿Incluye traslado?
}

export interface Expense {
    id: string;
    description: string;
    category: 'parts' | 'materials' | 'tools' | 'utilities' | 'rent' | 'marketing' | 'other';
    amount: number;
    date: string;
    serviceId?: string;
    createdAt: string;
}

export interface FinancialSummary {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    profitMargin: number;
    pendingInvoices: number;
    averageTicket: number;
    monthlyRevenue: number;
    monthlyExpenses: number;
}

export interface ServiceFormData {
    clientId: string;
    clientName: string;
    computer: ComputerSpecs;
    issue: string;
    estimatedDelivery: string;
    technician: string;
    costBreakdown: CostBreakdown;
    cost: number;
    customerApproved: boolean;
}