import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TECNOFIX - Gestión de Servicio Técnico',
  description: 'Sistema de gestión para mantenimiento y reparación de computadoras',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          <TooltipProvider>
            {children}
          </TooltipProvider>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}