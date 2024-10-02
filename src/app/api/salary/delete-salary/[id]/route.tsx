"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Salary } from "@/db/schema";

import { eq } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();

  try {
    await db
      .delete(Salary)
      .where(eq(Salary.index, Number(id)))
      .execute();
    return NextResponse.json({ message: "Data deleted successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to delete data" },
      { status: 500 }
    );
  }
}
