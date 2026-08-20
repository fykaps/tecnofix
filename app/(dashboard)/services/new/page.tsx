"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ServiceForm } from "@/components/services/ServiceForm";

export default function NewServicePage() {
    const router = useRouter();

    return (
        <div className="px-4 lg:px-6 space-y-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => router.push("/services")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Volver
                </Button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Nuevo Servicio</h2>
                    <p className="text-gray-500">Registra un nuevo servicio técnico</p>
                </div>
            </div>

            <ServiceForm mode="create" />
        </div>
    );
}