import { Client } from '@/types/client.types';
import { Service } from '@/types/service.types';
import initialData from './initial-data.json';

const STORAGE_KEYS = {
    CLIENTS: 'tecnoFix_clients',
    SERVICES: 'tecnoFix_services',
};

// Inicializar datos si no existen
export const initializeStorage = (): void => {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(initialData.clients));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(initialData.services));
    }
};

// Clientes
export const getClients = (): Client[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return data ? JSON.parse(data) : [];
};

export const getClient = (id: string): Client | undefined => {
    const clients = getClients();
    return clients.find(c => c.id === id);
};

export const saveClient = (client: Client): void => {
    if (typeof window === 'undefined') return;
    const clients = getClients();
    const index = clients.findIndex(c => c.id === client.id);
    if (index >= 0) {
        clients[index] = client;
    } else {
        clients.push(client);
    }
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
};

export const deleteClient = (id: string): void => {
    if (typeof window === 'undefined') return;
    const clients = getClients();
    const filtered = clients.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(filtered));
};

// Servicios
export const getServices = (): Service[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return data ? JSON.parse(data) : [];
};

export const getService = (id: string): Service | undefined => {
    const services = getServices();
    return services.find(s => s.id === id);
};

export const saveService = (service: Service): void => {
    if (typeof window === 'undefined') return;
    const services = getServices();
    const index = services.findIndex(s => s.id === service.id);
    if (index >= 0) {
        services[index] = service;
    } else {
        services.push(service);
    }
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
};

export const updateServiceStatus = (id: string, status: Service['status']): void => {
    const service = getService(id);
    if (service) {
        service.status = status;
        service.updatedAt = new Date().toISOString();
        if (status === 'delivered') {
            service.deliveredDate = new Date().toISOString();
        }
        saveService(service);
    }
};

export const deleteService = (id: string): void => {
    if (typeof window === 'undefined') return;
    const services = getServices();
    const filtered = services.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(filtered));
};

// Generar ID
export const generateId = (prefix: string): string => {
    const random = Math.random().toString(36).substring(2, 9);
    const timestamp = Date.now().toString(36);
    return `${prefix}-${timestamp}-${random}`;
};

// Generar número de ticket
export const generateTicketNumber = (): string => {
    const year = new Date().getFullYear();
    const services = getServices();
    const yearServices = services.filter(s => s.ticketNumber.includes(`${year}`));
    const count = yearServices.length + 1;
    return `TK-${year}-${String(count).padStart(3, '0')}`;
};