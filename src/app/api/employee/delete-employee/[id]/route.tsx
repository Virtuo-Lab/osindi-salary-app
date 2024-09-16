"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Employee } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop(); // Extract the ID from the URL

  await db.delete(Employee).where(eq(Employee.employeeId, Number(id))); // Use the extracted ID

  return new NextResponse();
}
