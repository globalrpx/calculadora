import { NextResponse } from "next/server";
import { getCurrentExchangeRate } from "@/lib/exchange-rate/get-ptax";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const exchangeRate = await getCurrentExchangeRate();

    return NextResponse.json(exchangeRate, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return NextResponse.json(
      { error: "exchange_rate_unavailable" },
      {
        status: 503,
        headers: { "Cache-Control": "no-store" }
      }
    );
  }
}
