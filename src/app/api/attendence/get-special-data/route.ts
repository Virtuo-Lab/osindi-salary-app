import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Advance, LeaveDay, SpecialLeaveDay } from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    // Perform the query
    const result = await db
      .select({
        employeeId: LeaveDay.employeeId,
        month: LeaveDay.month,
        year: LeaveDay.year,
        LeaveDay: LeaveDay.day,
        SpecialLeaveDay: sql<string[]>`
      COALESCE(array_agg(${SpecialLeaveDay.date} 
        ORDER BY ${SpecialLeaveDay.date} 
        NULLS LAST), '{}')
    `,
        Advance: Advance.amount,
      })
      .from(LeaveDay)
      .leftJoin(
        SpecialLeaveDay,
        and(
          eq(LeaveDay.employeeId, SpecialLeaveDay.employeeId),
          eq(LeaveDay.month, SpecialLeaveDay.month),
          eq(LeaveDay.year, SpecialLeaveDay.year)
        )
      )
      .leftJoin(
        Advance,
        and(
          eq(LeaveDay.employeeId, Advance.employeeId),
          eq(LeaveDay.month, Advance.month),
          eq(LeaveDay.year, Advance.year)
        )
      )
      .where(
        and(
          eq(LeaveDay.employeeId, data.employeeId),
          eq(LeaveDay.month, data.month),
          eq(LeaveDay.year, data.year)
        )
      )
      .groupBy(
        LeaveDay.employeeId,
        LeaveDay.month,
        LeaveDay.year,
        LeaveDay.day,
        Advance.amount
      );
    if (result.length === 0) {
      // Return 204 if no data found
      return new NextResponse(null, { status: 204 });
    }
    return NextResponse.json(result[0]);

    // Set the response
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 }
    );
  }
}
