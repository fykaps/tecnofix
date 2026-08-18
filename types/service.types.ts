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
    cost?: number;
    technician: string;
    ticketNumber: string;
    createdAt: string;
    updatedAt: string;
}

export interface ServiceFormData {
    clientId: string;
    clientName: string;
    computer: ComputerSpecs;
    issue: string;
    estimatedDelivery: string;
    technician: string;
}