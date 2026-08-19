"use client";

import * as React from "react";
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronsLeft,
    ChevronsRight,
    MoreVertical,
    // LayoutColumns,
} from "lucide-react";
import {
    columnFilteringFeature,
    columnVisibilityFeature,
    createColumnHelper,
    createFilteredRowModel,
    createPaginatedRowModel,
    createSortedRowModel,
    FlexRender,
    rowPaginationFeature,
    rowSortingFeature,
    tableFeatures,
    useTable,
    type ColumnFiltersState,
    type ColumnVisibilityState,
    type SortingState,
} from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { getServices } from "@/lib/data/storage";

const columnHelper = createColumnHelper<any>();

const columns = columnHelper.columns([
    columnHelper.accessor("ticketNumber", {
        header: "Ticket",
        cell: ({ row }) => (
            <span className="font-mono font-medium text-sm">{row.original.ticketNumber}</span>
        ),
    }),
    columnHelper.accessor("clientName", {
        header: "Cliente",
        cell: ({ row }) => <span className="font-medium">{row.original.clientName}</span>,
    }),
    columnHelper.accessor("computer", {
        header: "Equipo",
        cell: ({ row }) => (
            <div>
                <span className="text-sm">{row.original.computer}</span>
                <span className="text-xs text-gray-500 block">{row.original.type}</span>
            </div>
        ),
    }),
    columnHelper.accessor("entryDate", {
        header: "Fecha Ingreso",
        cell: ({ row }) => {
            const date = new Date(row.original.entryDate);
            return date.toLocaleDateString("es-ES", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });
        },
    }),
    columnHelper.accessor("cost", {
        header: "Costo",
        cell: ({ row }) => (
            <span className="font-medium text-blue-600">
                {new Intl.NumberFormat("es-PE", {
                    style: "currency",
                    currency: "PEN",
                }).format(row.original.cost || 0)}
            </span>
        ),
    }),
    columnHelper.accessor("status", {
        header: "Estado",
        cell: ({ row }) => {
            const status = row.original.status;
            const colors: Record<string, string> = {
                pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
                "in-progress": "bg-blue-100 text-blue-800 border-blue-200",
                completed: "bg-green-100 text-green-800 border-green-200",
                delivered: "bg-purple-100 text-purple-800 border-purple-200",
            };
            const labels: Record<string, string> = {
                pending: "Pendiente",
                "in-progress": "En Proceso",
                completed: "Completado",
                delivered: "Entregado",
            };
            return (
                <Badge className={colors[status] || colors.pending}>
                    {labels[status] || status}
                </Badge>
            );
        },
    }),
    columnHelper.accessor("technician", {
        header: "Técnico",
    }),
    columnHelper.display({
        id: "actions",
        cell: ({ row }) => (
            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="ghost"
                            className="flex size-8 text-muted-foreground data-[state=open]:bg-muted"
                            size="icon"
                        >
                            <MoreVertical className="h-4 w-4" />
                            <span className="sr-only">Abrir menú</span>
                        </Button>
                    }
                />
                <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem onClick={() => window.location.href = `/services/${row.original.id}`}>
                        Ver detalles
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = `/services/${row.original.id}/edit`}>
                        Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.location.href = `/tickets/${row.original.id}`}>
                        Imprimir Ticket
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        ),
    }),
]);

export function DataTable() {
    const [data, setData] = React.useState<any[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [rowSelection, setRowSelection] = React.useState({});
    const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({});
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    React.useEffect(() => {
        const services = getServices();
        const formattedData = services.map((s) => ({
            id: s.id,
            ticketNumber: s.ticketNumber,
            clientName: s.clientName,
            computer: `${s.computer.brand} ${s.computer.model}`,
            type: s.computer.type,
            entryDate: s.entryDate,
            cost: s.cost || 0,
            status: s.status,
            technician: s.technicianName || s.technician || "No asignado",
        }));
        setData(formattedData);
        setIsLoading(false);
    }, []);

    const features = tableFeatures({
        columnFilteringFeature,
        columnVisibilityFeature,
        rowPaginationFeature,
        rowSortingFeature,
        filteredRowModel: createFilteredRowModel(),
        paginatedRowModel: createPaginatedRowModel(),
        sortedRowModel: createSortedRowModel(),
    });

    const table = useTable({
        features,
        data,
        columns,
        state: {
            sorting,
            columnVisibility,
            rowSelection,
            columnFilters,
            pagination,
        },
        getRowId: (row) => row.id.toString(),
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
        );
    }

    return (
        <div className="w-full flex-col justify-start gap-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div className="flex items-center gap-2">
                    <Label className="text-sm font-medium">Servicios</Label>
                </div>
                <div className="flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger
                            render={
                                <Button variant="outline" size="sm">
                                    {/* <LayoutColumns className="h-4 w-4 mr-2" /> */}
                                    <span className="hidden lg:inline">Columnas</span>
                                    <ChevronDown className="h-4 w-4 ml-2" />
                                </Button>
                            }
                        />
                        <DropdownMenuContent align="end" className="w-56">
                            {table
                                .getAllColumns()
                                .filter(
                                    (column) =>
                                        typeof column.accessorFn !== "undefined" &&
                                        column.getCanHide()
                                )
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="relative flex flex-col gap-4 overflow-auto px-4 lg:px-6">
                <div className="overflow-hidden rounded-lg border">
                    <Table>
                        <TableHeader className="sticky top-0 z-10 bg-muted">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => {
                                        return (
                                            <TableHead key={header.id} colSpan={header.colSpan}>
                                                {header.isPlaceholder ? null : (
                                                    <FlexRender header={header} />
                                                )}
                                            </TableHead>
                                        );
                                    })}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        data-state={row.getIsSelected ? (row.getIsSelected() && "selected") : undefined}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                <FlexRender cell={cell} />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan={columns.length}
                                        className="h-24 text-center"
                                    >
                                        No hay servicios registrados.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                <div className="flex items-center justify-between px-4">
                    <div className="flex-1 text-sm text-muted-foreground">
                        {table.getFilteredRowModel().rows.length} servicio(s)
                    </div>
                    <div className="flex w-full items-center gap-8 lg:w-fit">
                        <div className="hidden items-center gap-2 lg:flex">
                            <Label htmlFor="rows-per-page" className="text-sm font-medium">
                                Filas por página
                            </Label>
                            <Select
                                value={`${table.state.pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value));
                                }}
                            >
                                <SelectTrigger size="sm" className="w-20" id="rows-per-page">
                                    <SelectValue placeholder={table.state.pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[5, 10, 20, 30, 50].map((pageSize) => (
                                        <SelectItem key={pageSize} value={`${pageSize}`}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex w-fit items-center justify-center text-sm font-medium">
                            Página {table.state.pagination.pageIndex + 1} de{" "}
                            {table.getPageCount()}
                        </div>
                        <div className="ml-auto flex items-center gap-2 lg:ml-0">
                            <Button
                                variant="outline"
                                className="hidden h-8 w-8 p-0 lg:flex"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Ir a primera página</span>
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <span className="sr-only">Ir a página anterior</span>
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="size-8"
                                size="icon"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Ir a página siguiente</span>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                className="hidden size-8 lg:flex"
                                size="icon"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <span className="sr-only">Ir a última página</span>
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}