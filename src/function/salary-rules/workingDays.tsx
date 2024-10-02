"use server";

import { db } from "@/db";
import { Attendance } from "@/db/schema";
import { count, eq, and, ne } from "drizzle-orm";

async function workingDaysForMonth(
  attendanceId: number,
  employeeId: number,
  month: number,
  year: number
) {
  const noOfDays = await db
    .select({
      count: count(Attendance.index),
    })
    .from(Attendance)
    .where(
      and(
        eq(Attendance.attendanceId, attendanceId),
        eq(Attendance.employeeId, employeeId),
        eq(Attendance.month, month),
        eq(Attendance.year, year),
        ne(Attendance.dutyOnTime, "empty"),
        ne(Attendance.dutyOffTime, "empty")
      )
    );

  return noOfDays[0].count;
}

export { workingDaysForMonth };
