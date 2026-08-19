import {
    LayoutDashboard,
    Users,
    Wrench,
    Ticket,
    Settings,
    FileText,
    Activity,
    DollarSign,
    UserCog,
    Home,
} from 'lucide-react';

export interface NavItem {
    id: string;
    title: string;
    url: string;
    icon?: any;
    disabled?: boolean;
    newTab?: boolean;
}

export interface NavGroup {
    id: string;
    label?: string;
    items: NavItem[];
}

export const sidebarItems: NavGroup[] = [
    {
        id: 'main',
        label: 'Principal',
        items: [
            {
                id: 'dashboard',
                title: 'Dashboard',
                url: '/dashboard',
                icon: LayoutDashboard,
            },
            {
                id: 'clients',
                title: 'Clientes',
                url: '/clients',
                icon: Users,
            },
            {
                id: 'services',
                title: 'Servicios',
                url: '/services',
                icon: Wrench,
            },
            {
                id: 'tickets',
                title: 'Tickets',
                url: '/tickets',
                icon: Ticket,
            },
        ],
    },
    {
        id: 'financial',
        label: 'Finanzas',
        items: [
            {
                id: 'income',
                title: 'Ingresos',
                url: '/income',
                icon: DollarSign,
                disabled: true,
            },
            {
                id: 'expenses',
                title: 'Gastos',
                url: '/expenses',
                icon: FileText,
                disabled: true,
            },
        ],
    },
    {
        id: 'system',
        label: 'Sistema',
        items: [
            {
                id: 'technicians',
                title: 'Técnicos',
                url: '/technicians',
                icon: UserCog,
                disabled: true,
            },
            {
                id: 'settings',
                title: 'Configuración',
                url: '/settings',
                icon: Settings,
                disabled: true,
            },
        ],
    },
];