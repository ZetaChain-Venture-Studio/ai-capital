import { NextRequest, NextResponse } from "next/server";
import { sql } from "@vercel/postgres";


export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userAddress } = body;

  if (!userAddress) {
    return NextResponse.json({ error: "User Address required" }, { status: 400 });
  }

  try {
    const result = await sql`
      SELECT success 
      FROM messages 
      WHERE user_address = ${userAddress};
    `;

    let score = 0;
    result.rows.forEach(row => {
      score += row.success ? 200 : 10;
    });

    return NextResponse.json({ score });
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    return NextResponse.json({ error: "Failed to call OpenAI API" }, { status: 500 });
  }
}
