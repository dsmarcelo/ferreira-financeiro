"use client";

import Header from "@/app/_components/header";
import { AddProductPurchaseForm } from "./add-product-purchase-form";

export default function AddProductPurchasePage() {
  return (
    <>
      <AddProductPurchaseForm header={<Header showBackButton={true} />} />
    </>
  );
}
