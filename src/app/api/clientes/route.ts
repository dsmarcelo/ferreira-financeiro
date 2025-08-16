import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { customers } from "@/server/db/schema/customers";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const rows = await db.select({ id: customers.id, name: customers.name }).from(customers).orderBy(asc(customers.name));
    return NextResponse.json(rows);
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as unknown;
    const name = typeof (body as any)?.name === "string" ? (body as any).name.trim() : "";
    if (!name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
    const [created] = await db.insert(customers).values({ name }).returning({ id: customers.id, name: customers.name });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}


