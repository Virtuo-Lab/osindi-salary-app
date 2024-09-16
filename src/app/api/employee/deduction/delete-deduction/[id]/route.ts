"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Deduction } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
  try {
    const id = req.nextUrl.pathname.split("/").pop(); // Extract the ID from the URL

    const deduction = await db
      .delete(Deduction)
      .where(eq(Deduction.index, Number(id))); // Use the extracted ID

    return NextResponse.json({ message: "Data deleted successfully" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
