import { NextResponse } from "next/server";
import { PortfolioResponse } from "@/utils/types/types";
import { sql } from "@vercel/postgres";

export async function GET(req: Request) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10); // Default limit is 10
    const cursor = url.searchParams.get("cursor"); // Cursor is optional

    let rows;

    if (cursor) {
      rows = await sql`
        SELECT *
        FROM portfolio
        WHERE id < ${cursor}
        ORDER BY id DESC
        LIMIT ${limit};
      `;
    } else {
      rows = await sql`
        SELECT *
        FROM portfolio
        ORDER BY id DESC
        LIMIT ${limit};
      `;
    }

    // Convert each row's portfolio_status (JSON string) back to Token array
    const portfolioResponses: PortfolioResponse[] = rows.rows.map(row => ({
      id: row.id,
      result: JSON.parse(row.portfolio_status),
    }));

    const nextCursor = portfolioResponses.length > 0 ? portfolioResponses[portfolioResponses.length - 1].id : null;

    return NextResponse.json({
      data: portfolioResponses,
      nextCursor, // Include the next cursor for client-side pagination
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  }
}
