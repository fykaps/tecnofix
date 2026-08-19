import { Client } from '@/types/client.types';
import { Service, Technician, Expense } from '@/types/service.types';
import initialData from './initial-data.json';

const STORAGE_KEYS = {
    CLIENTS: 'tecnoFix_clients',
    SERVICES: 'tecnoFix_services',
    TECHNICIANS: 'tecnoFix_technicians',
    EXPENSES: 'tecnoFix_expenses',
};

// Inicializar datos
export const initializeStorage = (): void => {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem(STORAGE_KEYS.CLIENTS)) {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(initialData.clients));
    }

    if (!localStorage.getItem(STORAGE_KEYS.SERVICES)) {
        localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(initialData.services));
    }

    if (!localStorage.getItem(STORAGE_KEYS.TECHNICIANS)) {
        localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(initialData.technicians || []));
    }

    if (!localStorage.getItem(STORAGE_KEYS.EXPENSES)) {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(initialData.expenses || []));
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

// ============================================================
// TÉCNICOS
// ============================================================

export const getTechnicians = (): Technician[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.TECHNICIANS);
    return data ? JSON.parse(data) : [];
};

export const getTechnician = (id: string): Technician | undefined => {
    const technicians = getTechnicians();
    return technicians.find(t => t.id === id);
};

export const saveTechnician = (technician: Technician): void => {
    if (typeof window === 'undefined') return;
    const technicians = getTechnicians();
    const index = technicians.findIndex(t => t.id === technician.id);
    if (index >= 0) {
        technicians[index] = technician;
    } else {
        technicians.push(technician);
    }
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(technicians));
};

export const deleteTechnician = (id: string): void => {
    if (typeof window === 'undefined') return;
    const technicians = getTechnicians();
    const filtered = technicians.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TECHNICIANS, JSON.stringify(filtered));
};

export const updateTechnicianStatus = (id: string, status: Technician['status'], serviceId?: string): void => {
    const technician = getTechnician(id);
    if (technician) {
        technician.status = status;
        technician.currentServiceId = serviceId;
        technician.updatedAt = new Date().toISOString();
        saveTechnician(technician);
    }
};

export const getAvailableTechnicians = (): Technician[] => {
    return getTechnicians().filter(t => t.status === 'available');
};

export const getBusyTechnicians = (): Technician[] => {
    return getTechnicians().filter(t => t.status === 'busy');
};

// Gastos
export const getExpenses = (): Expense[] => {
    if (typeof window === 'undefined') return [];
    const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return data ? JSON.parse(data) : [];
};

export const getExpense = (id: string): Expense | undefined => {
    const expenses = getExpenses();
    return expenses.find(e => e.id === id);
};

export const saveExpense = (expense: Expense): void => {
    if (typeof window === 'undefined') return;
    const expenses = getExpenses();
    const index = expenses.findIndex(e => e.id === expense.id);
    if (index >= 0) {
        expenses[index] = expense;
    } else {
        expenses.push(expense);
    }
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const deleteExpense = (id: string): void => {
    if (typeof window === 'undefined') return;
    const expenses = getExpenses();
    const filtered = expenses.filter(e => e.id !== id);
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(filtered));
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

// Obtener resumen financiero
export const getFinancialSummary = () => {
    const services = getServices();
    const expenses = getExpenses();

    const totalRevenue = services
        .filter(s => s.status === 'delivered' || s.status === 'completed')
        .reduce((sum, s) => sum + (s.cost || 0), 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthlyRevenue = services
        .filter(s => {
            const date = new Date(s.entryDate);
            return date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear &&
                (s.status === 'delivered' || s.status === 'completed');
        })
        .reduce((sum, s) => sum + (s.cost || 0), 0);

    const monthlyExpenses = expenses
        .filter(e => {
            const date = new Date(e.date);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        })
        .reduce((sum, e) => sum + e.amount, 0);

    const pendingInvoices = services
        .filter(s => s.status === 'pending' || s.status === 'in-progress')
        .reduce((sum, s) => sum + (s.cost || 0), 0);

    const deliveredServices = services.filter(s => s.status === 'delivered' || s.status === 'completed');
    const averageTicket = deliveredServices.length > 0
        ? totalRevenue / deliveredServices.length
        : 0;

    const profitMargin = totalRevenue > 0
        ? ((totalRevenue - totalExpenses) / totalRevenue) * 100
        : 0;

    return {
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        profitMargin,
        pendingInvoices,
        averageTicket,
        monthlyRevenue,
        monthlyExpenses,
    };
};