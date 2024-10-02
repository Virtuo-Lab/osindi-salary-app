"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Allowance } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { act } from "react";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop(); // Extract the ID from the URL

  const allowances = await db
    .select({
      allowanceId: Allowance.index,
      allowanceTitle: Allowance.allowanceTitle,
      amount: Allowance.amount,
      active: Allowance.activeStatus,
    })
    .from(Allowance)
    .where(
      and(
        eq(Allowance.employeeId, Number(id)),
        eq(Allowance.activeStatus, true)
      )
    ); // Use the extracted ID

  return NextResponse.json(allowances);
}
