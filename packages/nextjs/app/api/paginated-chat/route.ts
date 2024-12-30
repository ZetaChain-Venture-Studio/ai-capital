import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";
import { AIResponse } from "@/utils/types/types";


// export const dynamic = "force-dynamic";
// export const revalidate = 0;


/*
 * 
    Cursor Query Parameter: The cursor parameter is the id of the last fetched message. It's used to fetch the next set of messages created before this id.

    SQL Query:
    If a cursor is provided, the query retrieves rows with id < cursor.
    If no cursor is provided, it fetches the latest rows (ORDER BY id DESC LIMIT X).

    Response:
    data: The paginated messages.
    nextCursor: The id of the last message in the current batch, which the client can use for subsequent requests.

    Initial Request: 
    GET /api/paginated-chat?limit=10
    or
    GET /api/paginated-chat

    Subsequent Requests: 
    GET /api/paginated-chat?limit=10&cursor=72
    or
    GET /api/paginated-chat?cursor=72

    For private chat:
    GET /api/paginated-chat?userAddress=0xF2b5423128C34d0818F664A1CD7a52C111197C36
    or 
    GET /api/paginated-chat?userAddress=0xF2b5423128C34d0818F664A1CD7a52C111197C36&limit=3
    or
    GET /api/paginated-chat?userAddress=0xF2b5423128C34d0818F664A1CD7a52C111197C36&limit=3&cursor=69

 */
export async function GET(req: Request) {
  try {
    // Parse query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "10", 10); // Default limit is 10
    const cursor = url.searchParams.get("cursor"); // Cursor is optional
    const userAddress = url.searchParams.get("userAddress"); // Add this line

    let rows;

    //Second page + private chat
    if (cursor && userAddress) {
      rows = await sql`
        SELECT id, token, trade_type, allocation, pitch, ai_response_text, success, timestamp
        FROM messages
        WHERE id < ${cursor} AND user_address = ${userAddress}
        ORDER BY id DESC
        LIMIT ${limit};
      `;
    } 
    //Second page + global chat
    else if (cursor) {
      rows = await sql`
        SELECT id, token, trade_type, allocation, pitch, ai_response_text, success, timestamp
        FROM messages
        WHERE id < ${cursor}
        ORDER BY id DESC
        LIMIT ${limit};
      `;
    } 
    //First page + private chat
    else if (userAddress) {
      rows = await sql`
        SELECT id, token, trade_type, allocation, pitch, ai_response_text, success, timestamp
        FROM messages
        WHERE user_address = ${userAddress}
        ORDER BY id DESC
        LIMIT ${limit};
      `;
    }
    //First page + global chat 
    else {
      rows = await sql`
        SELECT id, token, trade_type, allocation, pitch, ai_response_text, success, timestamp
        FROM messages
        ORDER BY id DESC
        LIMIT ${limit};
      `;
    }

    // Transform rows into the AIResponse format
    const aiResponses: AIResponse[] = rows.rows.map((row: any) => ({
      id: row.id,
      userAddress: row.user_address,
      token: row.token,
      tradeType: row.trade_type,
      allocation: row.allocation,
      pitch: row.pitch,
      aiResponseText: row.ai_response_text,
      success: row.success,
      timestamp: row.timestamp,
    }));

    // Get the next cursor (id of the last item)
    const nextCursor = aiResponses.length > 0 ? aiResponses[aiResponses.length - 1].id : null;

    return NextResponse.json({
      data: aiResponses,
      nextCursor, // Include the next cursor for client-side pagination
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages." }, { status: 500 });
  }
}
