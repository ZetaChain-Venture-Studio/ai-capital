import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export interface AIResponse {
  token: string;
  tradeType: string;
  allocation: string;
  pitch: string;
  aiResponseText: string;
  success: boolean;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const rows = await sql`
      SELECT * FROM messages;
    `;

    console.log(rows.rowCount);

    const aiResponses: AIResponse[] = rows.rows.map((row: any) => ({
      token: row.token,
      tradeType: row.trade_type,
      allocation: row.allocation,
      pitch: row.pitch,
      aiResponseText: row.ai_response_text,
      success: row.success,
    }));

    return NextResponse.json(aiResponses);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  }
}
