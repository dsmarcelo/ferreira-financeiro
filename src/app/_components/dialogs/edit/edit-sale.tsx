"use client";

import EditSaleSheet from "../../sheets/edit-sale-sheet";
import type { Sale } from "@/server/db/schema/sales-schema";

interface EditSaleProps {
  data: Sale;
  children: React.ReactNode;
}

export default function EditSale({ data, children }: EditSaleProps) {
  return <EditSaleSheet sale={data}>{children}</EditSaleSheet>;
}

