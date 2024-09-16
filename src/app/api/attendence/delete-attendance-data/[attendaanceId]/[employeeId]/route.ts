"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Attendance } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function DELETE(req: NextRequest) {
  try {
    const pathSegments = req.nextUrl.pathname.split("/");
    const attendanceId = pathSegments[pathSegments.length - 2];
    const employeeId = pathSegments[pathSegments.length - 1];

    await db
      .delete(Attendance)
      .where(
        and(
          eq(Attendance.attendanceId, Number(attendanceId)),
          eq(Attendance.employeeId, Number(employeeId))
        )
      )
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
