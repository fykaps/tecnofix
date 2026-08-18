import { z } from 'zod';

export const clientSchema = z.object({
    name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
    phone: z.string().min(9, 'Ingresa un número válido'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    address: z.string().optional(),
    documentType: z.enum(['DNI', 'CE', 'RUC']),
    documentNumber: z.string().min(8, 'Documento inválido'),
});

export type ClientFormValues = z.infer<typeof clientSchema>;