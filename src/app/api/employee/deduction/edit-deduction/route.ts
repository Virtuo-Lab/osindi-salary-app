"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Deduction } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    const deduction = await db
      .update(Deduction)
      .set({
        deductionTitle: data.deductionTitle,
        amount: data.amount,
        activeStatus: data.activeStatus,
      })
      .where(eq(Deduction.index, data.deductionId));

    return NextResponse.json({ message: "Data updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
//
