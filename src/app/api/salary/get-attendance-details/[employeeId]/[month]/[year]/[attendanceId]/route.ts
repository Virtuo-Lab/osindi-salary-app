"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Attendance, Employee } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const pathSegments = req.nextUrl.pathname.split("/");

  const employeeId = pathSegments[pathSegments.length - 4];
  const month = pathSegments[pathSegments.length - 3];
  const year = pathSegments[pathSegments.length - 2];
  const attendanceId = pathSegments[pathSegments.length - 1];

  if (!employeeId || !month || !year) {
    return NextResponse.json(
      { error: "Missing required path parameters" },
      { status: 400 }
    );
  }

  try {
    const attendanceDetails = await db
      .select({
        attendanceId: Attendance.attendanceId,
        employeeId: Attendance.employeeId,
        employeeName: Employee.name,
        date: Attendance.date,
        inTime: Attendance.dutyOnTime,
        outTime: Attendance.dutyOffTime,
      })
      .from(Attendance)
      .innerJoin(Employee, eq(Attendance.employeeId, Employee.employeeId))
      .where(
        and(
          eq(Attendance.employeeId, Number(employeeId)),
          eq(Attendance.month, Number(month)),
          eq(Attendance.year, Number(year)),
          eq(Attendance.attendanceId, Number(attendanceId))
        )
      );

    if (attendanceDetails.length === 0) {
      return NextResponse.json(
        { error: "No attendance details found" },
        { status: 404 }
      );
    }

    return NextResponse.json(attendanceDetails);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve attendance details" },
      { status: 500 }
    );
  }
}
