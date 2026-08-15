import { db } from "@/db";
import { quotes } from "@/db/schema";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

// Get random quote or all quotes
export async function GET() {
  // Get a random quote using SQL
  const rows = await db
    .select()
    .from(quotes)
    .orderBy(sql`RANDOM()`)
    .limit(1);

  if (rows.length === 0) {
    // Return a default quote if none in DB
    return NextResponse.json({
      id: 0,
      text: "The secret of getting ahead is getting started.",
      author: "Mark Twain",
      category: "motivation",
    });
  }

  return NextResponse.json(rows[0]);
}
