import { NextRequest, NextResponse } from "next/server";
import { isResource } from "@/lib/resources";
import { readResource } from "@/lib/data-source";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Typed read endpoint for the data layer: GET /api/data/leads, /invoices, etc.
// Returns Supabase data when configured, otherwise seed data. This is the stable
// contract the frontend (and any future client/integration) reads through.
export async function GET(
  _req: NextRequest,
  { params }: { params: { resource: string } }
) {
  const { resource } = params;
  if (!isResource(resource)) {
    return NextResponse.json({ error: `unknown resource: ${resource}` }, { status: 404 });
  }
  const data = await readResource(resource);
  return NextResponse.json({ resource, count: data.length, data });
}
