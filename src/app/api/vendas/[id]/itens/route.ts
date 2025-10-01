import { NextResponse } from "next/server";
import { listItemsForSale } from "@/server/queries/sales-queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const resolvedParams = await params;
  const idNum = Number(resolvedParams?.id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  try {
    const items = await listItemsForSale(idNum);
    return NextResponse.json(items ?? []);
  } catch (e) {
    return NextResponse.json({ error: "failed to fetch items" }, { status: 500 });
  }
}
