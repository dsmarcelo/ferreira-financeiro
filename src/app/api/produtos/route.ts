import { NextResponse } from "next/server";
import { listProducts } from "@/server/queries/product-queries";

export async function GET() {
  try {
    const products = await listProducts();
    return NextResponse.json(products);
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}


