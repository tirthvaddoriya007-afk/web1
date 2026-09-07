import { NextResponse } from "next/server";
import { getProductPage } from "@/lib/data";

export function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
  return NextResponse.json(getProductPage(page));
}
