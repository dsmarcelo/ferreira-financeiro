import { NextResponse } from "next/server";
import { updateCategorySortOrders } from "@/server/queries/expense-category-queries";

export async function POST(request: Request) {
  try {
    const { order } = (await request.json()) as { order: number[] };
    const updates = order.map((id, index) => ({ id, sortOrder: index }));
    await updateCategorySortOrders(updates);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating category order:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}