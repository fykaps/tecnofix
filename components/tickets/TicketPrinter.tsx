'use client';

import { useEffect, useRef } from 'react';
import { Service } from '@/types/service.types';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface TicketPrinterProps {
    service: Service;
    onClose: () => void;
}

export function TicketPrinter({ service, onClose }: TicketPrinterProps) {
    const printRef = useRef<HTMLDivElement>(null);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handlePrint = () => {
        if (printRef.current) {
            const printContent = printRef.current.innerHTML;
            const win = window.open('', '_blank');
            if (win) {
                win.document.write(`
          <html>
            <head>
              <title>Ticket ${service.ticketNumber}</title>
              <style>
                body { 
                  font-family: 'Courier New', monospace;
                  width: 80mm;
                  margin: 0 auto;
                  padding: 10px;
                  background: white;
                  font-size: 12px;
                  line-height: 1.4;
                }
                .ticket {
                  text-align: center;
                }
                .header {
                  border-bottom: 1px dashed #000;
                  padding-bottom: 8px;
                  margin-bottom: 8px;
                }
                .header h2 {
                  margin: 0;
                  font-size: 18px;
                  letter-spacing: 2px;
                }
                .header p {
                  margin: 2px 0;
                  font-size: 11px;
                }
                .divider {
                  border-top: 1px dashed #000;
                  margin: 8px 0;
                }
                .row {
                  display: flex;
                  justify-content: space-between;
                  padding: 2px 0;
                }
                .label {
                  font-weight: bold;
                }
                .status-badge {
                  display: inline-block;
                  padding: 2px 8px;
                  background: #e5e7eb;
                  border-radius: 4px;
                  font-size: 11px;
                }
                .footer {
                  border-top: 1px dashed #000;
                  padding-top: 8px;
                  margin-top: 8px;
                  font-size: 10px;
                }
                @media print {
                  body { margin: 0; padding: 5px; }
                  .no-print { display: none; }
                }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
                win.document.close();
                setTimeout(() => {
                    win.print();
                    win.close();
                }, 500);
            }
        }
    };

    const getStatusLabel = (status: Service['status']) => {
        const labels = {
            pending: 'PENDIENTE',
            'in-progress': 'EN PROCESO',
            completed: 'COMPLETADO',
            delivered: 'ENTREGADO',
        };
        return labels[status] || status.toUpperCase();
    };

    return (
        <div className="space-y-4">
            <div ref={printRef} className="ticket" style={{ width: '80mm', margin: '0 auto' }}>
                <div className="header">
                    <h2>🔧 TECNOFIX</h2>
                    <p>SERVICIO TÉCNICO ESPECIALIZADO</p>
                    <p style={{ fontSize: '10px', color: '#666' }}>
                        Mantenimiento y Reparación de Computadoras
                    </p>
                    <div className="divider" />
                    <p>
                        <strong>TICKET:</strong> {service.ticketNumber}
                    </p>
                    <p style={{ fontSize: '10px', color: '#666' }}>
                        {formatDate(service.entryDate)} - {formatTime(service.entryDate)}
                    </p>
                </div>

                <div className="divider" />

                <div>
                    <div className="row">
                        <span className="label">Cliente:</span>
                        <span>{service.clientName}</span>
                    </div>
                    <div className="row">
                        <span className="label">Equipo:</span>
                        <span>{service.computer.brand} {service.computer.model}</span>
                    </div>
                    <div className="row">
                        <span className="label">Tipo:</span>
                        <span>{service.computer.type}</span>
                    </div>
                    <div className="row">
                        <span className="label">Estado:</span>
                        <span className="status-badge">{getStatusLabel(service.status)}</span>
                    </div>
                </div>

                <div className="divider" />

                <div style={{ textAlign: 'left' }}>
                    <p className="label">ESPECIFICACIONES TÉCNICAS:</p>
                    <div className="row">
                        <span>Procesador:</span>
                        <span>{service.computer.processor}</span>
                    </div>
                    <div className="row">
                        <span>RAM:</span>
                        <span>{service.computer.ram}</span>
                    </div>
                    <div className="row">
                        <span>Almacenamiento:</span>
                        <span>{service.computer.storage}</span>
                    </div>
                    {service.computer.graphics && (
                        <div className="row">
                            <span>Gráficos:</span>
                            <span>{service.computer.graphics}</span>
                        </div>
                    )}
                    <div className="row">
                        <span>Sistema Operativo:</span>
                        <span>{service.computer.operatingSystem}</span>
                    </div>
                </div>

                <div className="divider" />

                <div style={{ textAlign: 'left' }}>
                    <p className="label">PROBLEMA REPORTADO:</p>
                    <p style={{ fontSize: '11px', margin: '4px 0' }}>{service.issue}</p>
                </div>

                {service.diagnosis && (
                    <>
                        <div className="divider" />
                        <div style={{ textAlign: 'left' }}>
                            <p className="label">DIAGNÓSTICO:</p>
                            <p style={{ fontSize: '11px', margin: '4px 0' }}>{service.diagnosis}</p>
                        </div>
                    </>
                )}

                <div className="divider" />

                <div style={{ textAlign: 'left' }}>
                    <div className="row">
                        <span className="label">Técnico:</span>
                        <span>{service.technician}</span>
                    </div>
                    <div className="row">
                        <span className="label">Entrega estimada:</span>
                        <span>{formatDate(service.estimatedDelivery)}</span>
                    </div>
                    {service.cost && (
                        <div className="row">
                            <span className="label">Costo:</span>
                            <span>S/ {service.cost.toFixed(2)}</span>
                        </div>
                    )}
                </div>

                <div className="footer">
                    <p>
                        📞 {service.technician} | ✉️ tecno@fix.com
                    </p>
                    <p style={{ fontSize: '9px', color: '#999' }}>
                        * Este ticket es válido para retiro del equipo
                    </p>
                    <p style={{ fontSize: '9px', color: '#999', marginTop: '4px' }}>
                        Gracias por confiar en TECNOFIX
                    </p>
                </div>
            </div>

            <div className="flex justify-center gap-4 no-print">
                <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Ticket
                </Button>
                <Button variant="outline" onClick={onClose}>
                    Cerrar
                </Button>
            </div>
        </div>
    );
}