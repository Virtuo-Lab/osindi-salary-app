"use server";

import { db } from "@/db";
import { Attendance } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { daysForMonth } from "./days";

interface day {
  date: string;
  dutyOnTime: string;
  dutyOffTime: string;
}

export async function gotLeave(
  attendanceId: number,
  employeeId: number,
  month: number,
  year: number
) {
  const noOfDays = await daysForMonth(attendanceId, employeeId, month, year);

  const detailsOfDays: day[] = await db
    .select({
      date: Attendance.date,
      dutyOnTime: Attendance.dutyOnTime,
      dutyOffTime: Attendance.dutyOffTime,
    })
    .from(Attendance)
    .where(
      and(
        eq(Attendance.attendanceId, attendanceId),
        eq(Attendance.employeeId, employeeId),
        eq(Attendance.month, month),
        eq(Attendance.year, year)
      )
    );

  let leaveDays = 0;

  for (let i = 0; i < noOfDays; i++) {
    const dutyOnTime = detailsOfDays[i].dutyOnTime;
    const dutyOffTime = detailsOfDays[i].dutyOffTime;

    if (dutyOnTime === "empty" && dutyOffTime === "empty") {
      leaveDays++;
    }
  }
  return leaveDays;
}
