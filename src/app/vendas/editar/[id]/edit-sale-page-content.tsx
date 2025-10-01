"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import EditSaleForm from "@/app/_components/forms/edit-sale-form";
import type { Sale } from "@/server/db/schema/sales-schema";
import { ArrowLeft } from "lucide-react";

interface EditSalePageContentProps {
  sale: Sale;
}

export default function EditSalePageContent({
  sale,
}: EditSalePageContentProps) {
  const router = useRouter();

  const handleSuccess = () => {
    router.push("/vendas");
  };

  const handleClose = () => {
    router.push("/vendas");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.push("/vendas")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Editar Venda</h1>
          <p className="text-muted-foreground">
            Edite os detalhes da venda #{sale.id}
          </p>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6">
        <EditSaleForm
          sale={sale}
          onSuccess={handleSuccess}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}
