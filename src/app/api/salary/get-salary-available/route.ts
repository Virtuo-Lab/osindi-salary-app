"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Attendance, Employee, Salary } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { except } from "drizzle-orm/pg-core";

export async function GET(req: NextRequest) {
  const availableDetails = await except(
    db
      .selectDistinct({
        attendanceId: Attendance.attendanceId,
        employeeId: Attendance.employeeId,
        employeeName: Employee.name,
        month: Attendance.month,
        year: Attendance.year,
      })
      .from(Attendance)
      .innerJoin(Employee, eq(Attendance.employeeId, Employee.employeeId)),
    db
      .select({
        attendanceId: Salary.attendanceId,
        employeeId: Salary.employeeId,
        employeeName: Employee.name,
        month: Salary.month,
        year: Salary.year,
      })
      .from(Salary)
      .innerJoin(Employee, eq(Salary.employeeId, Employee.employeeId))
  ).execute();
  // Join with Employee table

  return NextResponse.json({ availableDetails });
}
