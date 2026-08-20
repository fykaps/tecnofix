"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ClientForm } from "@/components/clients/ClientForm";

export default function NewClientPage() {
    const router = useRouter();

    return (
        <div className="px-4 lg:px-6 space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push("/clients")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Nuevo Cliente</h2>
                    <p className="text-gray-500">Registra un nuevo cliente en el sistema</p>
                </div>
            </div>

            <Card className="border-none shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-semibold">Datos del Cliente</CardTitle>
                </CardHeader>
                <CardContent>
                    <ClientForm mode="create" />
                </CardContent>
            </Card>
        </div>
    );
}