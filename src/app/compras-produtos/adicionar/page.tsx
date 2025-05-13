"use client";

import Header from "@/app/_components/header";
import { AddProductPurchaseForm } from "../../_components/forms/add-product-purchase-form";

export default function AddProductPurchasePage() {
  return (
    <>
      <AddProductPurchaseForm header={<Header showBackButton={true} />} />
    </>
  );
}
