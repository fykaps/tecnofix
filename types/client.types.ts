export interface Client {
    id: string;
    name: string;
    phone: string;
    email?: string;
    address?: string;
    documentType: 'DNI' | 'CE' | 'RUC';
    documentNumber: string;
    createdAt: string;
    updatedAt: string;
}

export interface ClientFormData {
    name: string;
    phone: string;
    email?: string;
    address?: string;
    documentType: 'DNI' | 'CE' | 'RUC';
    documentNumber: string;
}