"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Deduction } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop(); // Extract the ID from the URL

  const deduction = await db
    .select({
      deductionId: Deduction.index,
      deductionTitle: Deduction.deductionTitle,
      amount: Deduction.amount,
      active: Deduction.activeStatus,
    })
    .from(Deduction)
    .where(
      and(
        eq(Deduction.employeeId, Number(id)),
        eq(Deduction.activeStatus, true)
      )
    ); // Use the extracted ID

  return NextResponse.json(deduction);
}
