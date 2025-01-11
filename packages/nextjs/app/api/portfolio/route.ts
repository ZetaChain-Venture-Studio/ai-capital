import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

export async function GET() {
  const tableName = process.env.PORTFOLIO_HISTORY_TABLE;

  if (!tableName) {
    console.error("environment variable not set");
    return NextResponse.json({ error: "environment variable not set" }, { status: 500 });
  }

  try {
    const queryText = `SELECT * FROM ${tableName}`;

    const rows = await sql.query(queryText);

    return NextResponse.json(rows.rows);
  } catch (error) {
    console.error("Error fetching Moralis data:", error);
    return new NextResponse("Error fetching data", { status: 500 });
  }
}
