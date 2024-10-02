"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Allowance } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    const allowance = await db
      .update(Allowance)
      .set({
        allowanceTitle: data.allowanceTitle,
        amount: data.amount,
        activeStatus: data.activeStatus,
      })
      .where(eq(Allowance.index, data.allowanceId));

    return NextResponse.json({ message: "Data updated successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}
