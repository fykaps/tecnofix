import { z } from 'zod';

export const computerSpecsSchema = z.object({
    brand: z.string().min(2, 'Marca requerida'),
    model: z.string().min(2, 'Modelo requerido'),
    type: z.enum(['Desktop', 'Laptop', 'All-in-One']),
    processor: z.string().min(2, 'Procesador requerido'),
    ram: z.string().min(1, 'RAM requerida'),
    storage: z.string().min(1, 'Almacenamiento requerido'),
    graphics: z.string().optional(),
    operatingSystem: z.string().min(2, 'Sistema operativo requerido'),
    observations: z.string().optional(),
});

export const serviceSchema = z.object({
    clientId: z.string().min(1, 'Selecciona un cliente'),
    clientName: z.string().min(3, 'Nombre del cliente requerido'),
    computer: computerSpecsSchema,
    issue: z.string().min(10, 'Describe el problema con más detalle'),
    estimatedDelivery: z.string().min(1, 'Fecha estimada de entrega requerida'),
    technician: z.string().min(3, 'Técnico requerido'),
});

export type ServiceFormValues = z.infer<typeof serviceSchema>;