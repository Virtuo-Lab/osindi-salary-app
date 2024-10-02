"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Allowance } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    await db.insert(Allowance).values({
      employeeId: data.employeeId,
      allowanceTitle: data.allowanceTitle,
      amount: data.amount,
      activeStatus: data.activeStatus,
      modifiedDate: new Date(),
      createdDate: new Date(),
    });

    return NextResponse.json({ message: "Data inserted successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to insert data" },
      { status: 500 }
    );
  }
}
