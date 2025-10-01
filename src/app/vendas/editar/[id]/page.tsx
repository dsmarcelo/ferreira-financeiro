import { notFound } from "next/navigation";
import { Suspense } from "react";
import Loading from "@/app/_components/loading/loading";
import Header from "@/app/_components/header";
import EditSalePageContent from "./edit-sale-page-content";
import { actionGetSaleById } from "@/actions/sales-actions";

interface EditSalePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditSalePage({ params }: EditSalePageProps) {
  const { id } = await params;

  if (!id || isNaN(Number(id))) {
    notFound();
  }

  const sale = await actionGetSaleById(Number(id));

  if (!sale) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col pb-24">
      <Header className="sticky top-0 z-50 flex-none" />
      <main className="container mx-auto mt-4 flex h-full max-w-screen-lg flex-1 flex-col gap-4 px-3">
        <Suspense fallback={<Loading />}>
          <EditSalePageContent sale={sale} />
        </Suspense>
      </main>
    </div>
  );
}
