import { NextResponse } from "next/server";
import { PortfolioResponse } from "@/utils/types/types";
import { sql } from "@vercel/postgres";

/*
Query this endpoint like so - get the 10 latest snapshots:
/api/paginated-portfolio

Query like this to limit to only the latest snapshot:
/api/paginated-portfolio?limit=1

Query like this for the second page starting at entry 2:
/api/paginated-portfolio?limit=1&cursor=2

*/
// export async function GET(req: Request) {
//   try {
//     // Parse query parameters
//     const url = new URL(req.url);
//     const limit = parseInt(url.searchParams.get("limit") || "10", 10); // Default limit is 10
//     const cursor = url.searchParams.get("cursor"); // Cursor is optional

//     let rows;

//     if (cursor) {
//       rows = await sql`
//         SELECT *
//         FROM portfolio
//         WHERE id < ${cursor}
//         ORDER BY id DESC
//         LIMIT ${limit};
//       `;
//     } else {
//       rows = await sql`
//         SELECT *
//         FROM portfolio
//         ORDER BY id DESC
//         LIMIT ${limit};
//       `;
//     }

//     // Convert each row's portfolio_status (JSON string) back to Token array
//     const portfolioResponses: PortfolioResponse[] = rows.rows.map(row => ({
//       id: row.id,
//       created_at: row.created_at,
//       result: JSON.parse(row.portfolio_status),
//     }));

//     const nextCursor = portfolioResponses.length > 0 ? portfolioResponses[portfolioResponses.length - 1].id : null;

//     return NextResponse.json({
//       data: portfolioResponses,
//       nextCursor, // Include the next cursor for client-side pagination
//     });
//   } catch (error) {
//     console.error("Error fetching messages:", error);
//     return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
//   }
// }

export async function GET(req: Request) {
  const tableName = process.env.PORTFOLIO_HISTORY_TABLE;

  if (!tableName) {
    console.error("environment variable not set");
    return NextResponse.json({ error: "environment variable not set" }, { status: 500 });
  }

  try {
    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "24");

    const queryText = `
        SELECT *
        FROM ${tableName}
        ORDER BY id DESC
        LIMIT ${limit};
      `;

    // let queryText;

    // if (limit === 24) {
    //   queryText = `
    //     SELECT *
    //     FROM ${tableName}
    //     ORDER BY id DESC
    //     LIMIT 24;
    //   `;
    // } else if (limit === 168) {
    //   queryText = `
    //     SELECT *
    //     FROM ${tableName}
    //     WHERE date >= CURRENT_DATE - INTERVAL '7 days'
    //     ORDER BY id DESC
    //     LIMIT 168;
    //   `;
    // } else if (limit === 720) {
    //   queryText = `
    //     SELECT *
    //     FROM ${tableName}
    //     WHERE date >= CURRENT_DATE - INTERVAL '30 days'
    //     ORDER BY id DESC
    //     LIMIT 720;  -- Últimos 30 días
    //   `;
    // } else {
    //   queryText = `
    //     SELECT *
    //     FROM ${tableName}
    //     ORDER BY id DESC;
    //   `;
    // }

    const rows = await sql.query(queryText);

    return NextResponse.json(rows.rows.reverse());
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  }
}
