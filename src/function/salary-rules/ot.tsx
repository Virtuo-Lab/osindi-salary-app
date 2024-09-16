"use server";

import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { daysForMonth } from "./days";
import { Attendance, Employee } from "@/db/schema";

interface day {
  date: string;
  dutyOnTime: string;
  dutyOffTime: string;
}

export async function ot(
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

  let otHours = 0;

  console.log("attendanceId", attendanceId);
  console.log("employeeId", employeeId);
  console.log("month", month);
  console.log("year", year);

  const shiftStart = await db
    .select({
      shiftStart: Employee.dutyOnTime,
    })
    .from(Employee)
    .where(eq(Employee.employeeId, employeeId));

  console.log("shiftStart", shiftStart);

  const shiftEnd = await db
    .select({
      shiftEnd: Employee.dutyOffTime,
    })
    .from(Employee)
    .where(eq(Employee.employeeId, employeeId));

  console.log("shiftEnd", shiftEnd);

  const shiftStartTime = shiftStart[0].shiftStart; // "10:15"
  const shiftEndTime = shiftEnd[0].shiftEnd; // "19:15"

  console.log("noOfDays", noOfDays);
  for (let i = 0; i < noOfDays; i++) {
    console.log("i", i);
    if (
      detailsOfDays[i].dutyOnTime === null ||
      detailsOfDays[i].dutyOffTime === null
    ) {
      continue;
    }
    const dutyOnTime = detailsOfDays[i].dutyOnTime;
    const dutyOffTime = detailsOfDays[i].dutyOffTime;
    if (dutyOnTime === "empty" || dutyOffTime === "empty") {
      continue;
    }

    const date = detailsOfDays[i].date.split("T")[0]; // Extract the date part

    // Parse time strings as UTC to avoid time zone conversions
    const [endHour, endMinute] = shiftEndTime.split(":").map(Number);
    const otStart = new Date(
      Date.UTC(
        year,
        month - 1,
        parseInt(date.split("-")[2]),
        endHour,
        endMinute
      )
    );

    console.log("otStart", otStart);

    const otEnd = new Date(dutyOffTime);

    if (otStart < otEnd) {
      let otHoursBeforeRound = (otEnd.getTime() - otStart.getTime()) / 3600000;
      let otHoursRounded = Math.floor(otHoursBeforeRound * 2) / 2;
      //console.log(otStart, otEnd, otHoursRounded);
      otHours += otHoursRounded;
    }

    console.log("otHours", otHours);

    // Parse time strings as UTC to avoid time zone conversions
    const [startHour, startMinute] = shiftStartTime.split(":").map(Number);
    const otStart2 = new Date(dutyOnTime);
    const otEnd2 = new Date(
      Date.UTC(
        year,
        month - 1,
        parseInt(date.split("-")[2]),
        startHour,
        startMinute
      )
    );

    console.log("otStart2", otStart2);

    if (otStart2 < otEnd2) {
      console.log("otStart2 < otEnd2");
      let otHoursBeforeRound =
        (otEnd2.getTime() - otStart2.getTime()) / 3600000;
      let otHoursRounded = Math.floor(otHoursBeforeRound * 2) / 2;
      //console.log(otStart2, otEnd2, otHoursRounded);
      otHours += otHoursRounded;
    }
  }

  console.log("otHours", otHours);

  return otHours;
}
