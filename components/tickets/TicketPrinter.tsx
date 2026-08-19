'use client';

import { useEffect, useRef, useState } from 'react';
import { Service } from '@/types/service.types';
import { Button } from '@/components/ui/button';
import { Printer, X, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { getTechnician } from '@/lib/data/storage';

interface TicketPrinterProps {
    service: Service;
    onClose: () => void;
    open: boolean;
}

export function TicketPrinter({ service, onClose, open }: TicketPrinterProps) {
    const printRef = useRef<HTMLDivElement>(null);
    const [isPrinting, setIsPrinting] = useState(false);
    const [technicianName, setTechnicianName] = useState(service.technicianName || '');

    useEffect(() => {
        // Obtener nombre completo del técnico si solo tenemos ID
        if (service.technician && !service.technicianName) {
            const tech = getTechnician(service.technician);
            if (tech) {
                setTechnicianName(tech.name);
            }
        }
    }, [service]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatDateTime = (dateString: string) => {
        return `${formatDate(dateString)} ${formatTime(dateString)}`;
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

    const getStatusEmoji = (status: Service['status']) => {
        const emojis = {
            pending: '⏳',
            'in-progress': '🔧',
            completed: '✅',
            delivered: '📦',
        };
        return emojis[status] || '📋';
    };

    const formatCurrency = (value: number) => {
        return `S/ ${value.toFixed(2)}`;
    };

    const handlePrint = () => {
        if (printRef.current) {
            setIsPrinting(true);
            const printContent = printRef.current.innerHTML;
            const win = window.open('', '_blank', 'width=400,height=600');
            if (win) {
                win.document.write(`
                    <html>
                        <head>
                            <title>Ticket ${service.ticketNumber}</title>
                            <style>
                                /* Reset y configuración para POS-58 (58mm) */
                                * {
                                    margin: 0;
                                    padding: 0;
                                    box-sizing: border-box;
                                }
                                body {
                                    font-family: 'Courier New', monospace;
                                    width: 58mm;
                                    margin: 0 auto;
                                    padding: 4px 8px;
                                    background: white;
                                    font-size: 11px;
                                    line-height: 1.3;
                                    color: #000;
                                }
                                .ticket {
                                    width: 100%;
                                }
                                /* Encabezado */
                                .header {
                                    text-align: center;
                                    padding: 4px 0 6px 0;
                                    border-bottom: 1px dashed #000;
                                    margin-bottom: 4px;
                                }
                                .header .logo-text {
                                    font-size: 18px;
                                    font-weight: bold;
                                    letter-spacing: 2px;
                                    color: #1a3a5c;
                                }
                                .header .subtitle {
                                    font-size: 9px;
                                    color: #666;
                                    letter-spacing: 1px;
                                }
                                .header .divider {
                                    border-top: 1px dashed #000;
                                    margin: 4px 0;
                                }
                                .header .ticket-number {
                                    font-size: 13px;
                                    font-weight: bold;
                                    letter-spacing: 1px;
                                    background: #f0f0f0;
                                    padding: 2px 8px;
                                    display: inline-block;
                                    border-radius: 2px;
                                    margin-top: 2px;
                                }
                                /* Información del ticket */
                                .info-row {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 1px 0;
                                    font-size: 10px;
                                }
                                .info-row .label {
                                    font-weight: bold;
                                }
                                .section-title {
                                    font-weight: bold;
                                    text-align: center;
                                    padding: 3px 0;
                                    font-size: 10px;
                                    border-top: 1px dotted #ccc;
                                    border-bottom: 1px dotted #ccc;
                                    margin: 4px 0 3px 0;
                                    letter-spacing: 1px;
                                    background: #f8f8f8;
                                }
                                .divider-dash {
                                    border-top: 1px dashed #000;
                                    margin: 3px 0;
                                }
                                .divider-dot {
                                    border-top: 1px dotted #999;
                                    margin: 3px 0;
                                }
                                /* Detalles del equipo */
                                .spec-row {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 1px 0;
                                    font-size: 9px;
                                }
                                .spec-row .label {
                                    color: #555;
                                }
                                .spec-row .value {
                                    font-weight: 500;
                                    text-align: right;
                                    max-width: 55%;
                                }
                                .issue-text {
                                    font-size: 9px;
                                    padding: 2px 0;
                                    color: #333;
                                    border-left: 2px solid #f59e0b;
                                    padding-left: 4px;
                                    margin: 2px 0;
                                }
                                /* Estado */
                                .status-badge {
                                    text-align: center;
                                    padding: 3px 0;
                                    font-weight: bold;
                                    font-size: 12px;
                                    letter-spacing: 2px;
                                    border-radius: 2px;
                                    margin: 3px 0;
                                }
                                .status-pending { color: #b45309; background: #fffbeb; }
                                .status-progress { color: #1d4ed8; background: #eff6ff; }
                                .status-completed { color: #15803d; background: #f0fdf4; }
                                .status-delivered { color: #7c3aed; background: #f5f3ff; }
                                /* Costos */
                                .cost-row {
                                    display: flex;
                                    justify-content: space-between;
                                    padding: 1px 0;
                                    font-size: 10px;
                                }
                                .cost-row .label {
                                    color: #555;
                                }
                                .cost-total {
                                    font-size: 14px;
                                    font-weight: bold;
                                    text-align: center;
                                    padding: 4px 0;
                                    border-top: 2px solid #000;
                                    border-bottom: 2px solid #000;
                                    margin: 3px 0;
                                }
                                /* Footer */
                                .footer {
                                    text-align: center;
                                    padding: 4px 0 2px 0;
                                    border-top: 1px dashed #000;
                                    margin-top: 4px;
                                    font-size: 8px;
                                    color: #666;
                                }
                                .footer .thanks {
                                    font-size: 11px;
                                    font-weight: bold;
                                    color: #1a3a5c;
                                    margin-bottom: 2px;
                                }
                                .footer .contact {
                                    font-size: 8px;
                                    color: #888;
                                }
                                .barcode {
                                    text-align: center;
                                    font-family: 'Courier New', monospace;
                                    font-size: 16px;
                                    letter-spacing: 3px;
                                    padding: 4px 0;
                                    color: #333;
                                }
                                .watermark {
                                    text-align: center;
                                    font-size: 7px;
                                    color: #ccc;
                                    margin-top: 2px;
                                }
                                @media print {
                                    body { margin: 0; padding: 4px 6px; }
                                    .no-print { display: none; }
                                }
                                /* Ajustes para impresión */
                                @page {
                                    size: 58mm auto;
                                    margin: 0;
                                }
                            </style>
                        </head>
                        <body>
                            ${printContent}
                            <script>
                                // Auto-print cuando se carga
                                window.onload = function() {
                                    setTimeout(function() {
                                        window.print();
                                    }, 300);
                                };
                            <\/script>
                        </body>
                    </html>
                `);
                win.document.close();
                // Cerrar ventana después de imprimir
                setTimeout(() => {
                    win.close();
                    setIsPrinting(false);
                    onClose();
                }, 1500);
            }
        }
    };

    const ticketHTML = (
        <div className="ticket" ref={printRef}>
            {/* ============================================================
                ENCABEZADO
                ============================================================ */}
            <div className="header">
                <div className="logo-text">🔧 TECNOFIX</div>
                <div className="subtitle">SERVICIO TÉCNICO ESPECIALIZADO</div>
                <div className="divider" />
                <div className="ticket-number"># {service.ticketNumber}</div>
                <div style={{ fontSize: '8px', color: '#999', marginTop: '2px' }}>
                    {formatDateTime(service.entryDate)}
                </div>
            </div>

            {/* ============================================================
                INFORMACIÓN DEL CLIENTE
                ============================================================ */}
            <div className="section-title">DATOS DEL CLIENTE</div>
            <div className="info-row">
                <span className="label">Cliente:</span>
                <span>{service.clientName}</span>
            </div>

            {/* ============================================================
                INFORMACIÓN DEL EQUIPO
                ============================================================ */}
            <div className="section-title">ESPECIFICACIONES TÉCNICAS</div>
            <div className="spec-row">
                <span className="label">Marca/Modelo:</span>
                <span className="value">{service.computer.brand} {service.computer.model}</span>
            </div>
            <div className="spec-row">
                <span className="label">Tipo:</span>
                <span className="value">{service.computer.type}</span>
            </div>
            <div className="spec-row">
                <span className="label">Procesador:</span>
                <span className="value">{service.computer.processor}</span>
            </div>
            <div className="spec-row">
                <span className="label">RAM:</span>
                <span className="value">{service.computer.ram}</span>
            </div>
            <div className="spec-row">
                <span className="label">Almacenamiento:</span>
                <span className="value">{service.computer.storage}</span>
            </div>
            {service.computer.graphics && (
                <div className="spec-row">
                    <span className="label">Gráficos:</span>
                    <span className="value">{service.computer.graphics}</span>
                </div>
            )}
            <div className="spec-row">
                <span className="label">S.O.:</span>
                <span className="value">{service.computer.operatingSystem}</span>
            </div>
            {service.computer.observations && (
                <div className="spec-row" style={{ borderTop: '1px dotted #ccc', marginTop: '2px', paddingTop: '2px' }}>
                    <span className="label">Observaciones:</span>
                    <span className="value" style={{ fontSize: '8px' }}>{service.computer.observations}</span>
                </div>
            )}

            {/* ============================================================
                PROBLEMA REPORTADO
                ============================================================ */}
            <div className="section-title">PROBLEMA REPORTADO</div>
            <div className="issue-text">
                {service.issue}
            </div>

            {/* ============================================================
                DIAGNÓSTICO (si existe)
                ============================================================ */}
            {service.diagnosis && (
                <>
                    <div className="section-title">DIAGNÓSTICO</div>
                    <div className="issue-text" style={{ borderLeftColor: '#3b82f6' }}>
                        {service.diagnosis}
                    </div>
                </>
            )}

            {/* ============================================================
                REPARACIÓN (si existe)
                ============================================================ */}
            {service.repairDetails && (
                <>
                    <div className="section-title">REPARACIÓN REALIZADA</div>
                    <div className="issue-text" style={{ borderLeftColor: '#22c55e' }}>
                        {service.repairDetails}
                    </div>
                </>
            )}

            {/* ============================================================
                ESTADO
                ============================================================ */}
            <div className={`status-badge status-${service.status}`}>
                {getStatusEmoji(service.status)} {getStatusLabel(service.status)}
            </div>

            {/* ============================================================
                COSTOS
                ============================================================ */}
            {service.costBreakdown && (
                <>
                    <div className="section-title">DETALLE DE COSTOS</div>
                    {service.costBreakdown.labor > 0 && (
                        <div className="cost-row">
                            <span className="label">Mano de obra</span>
                            <span>{formatCurrency(service.costBreakdown.labor)}</span>
                        </div>
                    )}
                    {service.costBreakdown.parts > 0 && (
                        <div className="cost-row">
                            <span className="label">Repuestos</span>
                            <span>{formatCurrency(service.costBreakdown.parts)}</span>
                        </div>
                    )}
                    {service.costBreakdown.materials > 0 && (
                        <div className="cost-row">
                            <span className="label">Materiales</span>
                            <span>{formatCurrency(service.costBreakdown.materials)}</span>
                        </div>
                    )}
                    {service.costBreakdown.travel > 0 && (
                        <div className="cost-row">
                            <span className="label">Traslado</span>
                            <span>{formatCurrency(service.costBreakdown.travel)}</span>
                        </div>
                    )}
                    <div className="divider-dot" />
                    <div className="cost-total">
                        TOTAL: {formatCurrency(service.cost || service.costBreakdown.total || 0)}
                    </div>
                </>
            )}

            {/* ============================================================
                INFORMACIÓN ADICIONAL
                ============================================================ */}
            <div className="divider-dash" />
            <div className="info-row">
                <span className="label">Técnico:</span>
                <span>{technicianName || service.technician || 'No asignado'}</span>
            </div>
            <div className="info-row">
                <span className="label">Entrega estimada:</span>
                <span>{formatDate(service.estimatedDelivery)}</span>
            </div>
            {service.deliveredDate && (
                <div className="info-row">
                    <span className="label">Entregado:</span>
                    <span>{formatDateTime(service.deliveredDate)}</span>
                </div>
            )}

            {/* ============================================================
                CÓDIGO DE BARRAS (simulado)
                ============================================================ */}
            <div className="barcode">
                {service.ticketNumber.replace(/[^0-9]/g, '').padStart(12, '0')}
            </div>

            {/* ============================================================
                FOOTER
                ============================================================ */}
            <div className="footer">
                <div className="thanks">¡Gracias por confiar en TECNOFIX!</div>
                <div className="contact">
                    📞 {technicianName ? technicianName : 'Técnico'} | ✉️ tecno@fix.com
                </div>
                <div style={{ fontSize: '7px', color: '#aaa', marginTop: '2px' }}>
                    * Este ticket es válido para retiro del equipo
                </div>
                <div className="watermark">
                    TECNOFIX v1.0 • {formatDate(new Date().toISOString())}
                </div>
            </div>
        </div>
    );

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Printer className="h-5 w-5" />
                        Ticket #{service.ticketNumber}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {/* Vista previa del ticket */}
                    <div className="border rounded-lg p-4 bg-gray-50 overflow-auto max-h-[500px]">
                        <div style={{ width: '58mm', margin: '0 auto' }}>
                            {ticketHTML}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                        <X className="h-4 w-4 mr-2" />
                        Cerrar
                    </Button>
                    <Button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={isPrinting}
                    >
                        {isPrinting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Imprimiendo...
                            </>
                        ) : (
                            <>
                                <Printer className="h-4 w-4 mr-2" />
                                Imprimir Ticket
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}