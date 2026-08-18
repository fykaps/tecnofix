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
    labor: number;
    parts: number;
    materials: number;
    travel: number;
    total: number;
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
    // ✅ NUEVO: Tipo de servicio para la cotización
    serviceType?: string;           // ID del servicio en el catálogo
    serviceTypeName?: string;       // Nombre del servicio en el catálogo
    cost: number;
    estimatedCost: number;
    finalCost?: number;
    customerApproved: boolean;
    approvalDate?: string;
    statusHistory: Array<{
        status: Service['status'];
        date: string;
        note?: string;
    }>;
}

export interface ServiceCatalog {
    id: string;
    name: string;
    description: string;
    basePrice: number;
    laborHours: number;
    category: 'software' | 'hardware' | 'maintenance' | 'diagnostic' | 'network';
    includesTravel: boolean;
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
    serviceType?: string;      // ✅ NUEVO
    serviceTypeName?: string;  // ✅ NUEVO
}