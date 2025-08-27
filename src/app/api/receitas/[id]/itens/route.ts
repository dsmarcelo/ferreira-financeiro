import { NextResponse } from "next/server";
import { listItemsForIncome } from "@/server/queries/income-queries";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const idNum = Number(params.id);
  if (!Number.isFinite(idNum) || idNum <= 0) {
    return NextResponse.json({ error: "invalid id" }, { status: 400 });
  }

  try {
    const items = await listItemsForIncome(idNum);
    return NextResponse.json(items ?? []);
  } catch (e) {
    return NextResponse.json({ error: "failed to fetch items" }, { status: 500 });
  }
}


