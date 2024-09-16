/*"use server";

import { db } from "@/db";
import { Attendance, Employee } from "@/db/schema";
import { daysForMonth } from "./days";
import { eq, and } from "drizzle-orm";

export async function lateDay(employeeId: number, month: number, year: number) {
  const noOfDays = await daysForMonth(employeeId, month, year);

  const detailsOfDays = await db
    .select({
      date: Attendance.date,
      dutyOnTime: Attendance.dutyOnTime,
      dutyOffTime: Attendance.dutyOffTime,
    })
    .from(Attendance)
    .where(
      and(
        eq(Attendance.employeeId, employeeId),
        eq(Attendance.month, month),
        eq(Attendance.year, year)
      )
    );

  let lateDays1 = 0;
  let lateDays2 = 0;
  let additionalOT = 0;

  const shiftStart = await db
    .select({
      shiftStart: Employee.dutyOnTime,
    })
    .from(Employee)
    .where(eq(Employee.employeeId, employeeId));

  const shiftStartTime = shiftStart[0].shiftStart;

  // limit of the minutes to be considered as late
  let limit = 15;

  for (let i = 0; i < noOfDays; i++) {
    const dutyOnTime = detailsOfDays[i].dutyOnTime;
    const date = detailsOfDays[i].date;

    const shiftStart = new Date(date + " " + shiftStartTime);
    const dutyOn = new Date(date + " " + dutyOnTime);

    if (dutyOn > shiftStart) {
      const diff = (dutyOn.getTime() - shiftStart.getTime()) / 60000;

      if (diff > 240) {
        lateDays2++;
        let additionalOTHoursBeforeRound = diff / 60;
        //round it to previous 0.5 hours
        additionalOTHoursBeforeRound =
          Math.floor(additionalOTHoursBeforeRound * 2) / 2;
        additionalOT = additionalOT + additionalOTHoursBeforeRound;
      } else {
        limit = limit - diff;
        if (limit < 0) {
          lateDays1++;
        }
      }
    }
  }

  return { lateDays1, lateDays2, additionalOT };
}
*/

"use server";

import { db } from "@/db";
import { Attendance, Employee } from "@/db/schema";
import { daysForMonth } from "./days";
import { eq, and } from "drizzle-orm";

export async function lateDay(
  attendanceId: number,
  employeeId: number,
  month: number,
  year: number
) {
  const noOfDays = await daysForMonth(attendanceId, employeeId, month, year);

  const detailsOfDays = await db
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

  let lateDays1 = 0;
  let lateDays2 = 0;
  let additionalOT = 0;

  const shiftStartResult = await db
    .select({
      shiftStart: Employee.dutyOnTime,
    })
    .from(Employee)
    .where(eq(Employee.employeeId, employeeId));

  if (shiftStartResult.length === 0) {
    throw new Error("Shift start time not found for employee.");
  }

  const shiftStartTime = shiftStartResult[0].shiftStart;
  let limit = 15; // Define limit of minutes to be considered as late

  for (let i = 0; i < noOfDays; i++) {
    const dutyOnTime = detailsOfDays[i].dutyOnTime;

    if (dutyOnTime === "empty") {
      continue;
    }

    const date = detailsOfDays[i].date.split("T")[0];

    // Parse the date and times correctly
    const [endHour, endMinute] = shiftStartTime.split(":").map(Number);
    const shiftStart = new Date(
      Date.UTC(
        year,
        month - 1,
        parseInt(date.split("-")[2]),
        endHour,
        endMinute
      )
    );
    //const shiftStart = new Date(`${date}T${shiftStartTime}`);
    const dutyOn = new Date(dutyOnTime);

    console.log(shiftStart, dutyOn);

    if (dutyOn > shiftStart) {
      const diff = (dutyOn.getTime() - shiftStart.getTime()) / 60000; // Difference in minutes

      if (diff > 300) {
        // If late more than 4 hours
        lateDays2++;
        let additionalOTHoursBeforeRound = diff / 60; // Convert minutes to hours
        additionalOTHoursBeforeRound =
          Math.floor(additionalOTHoursBeforeRound * 2) / 2; // Round to previous 0.5 hours
        additionalOT += additionalOTHoursBeforeRound;
      } else {
        let remainingLimit = limit - diff; // Calculate remaining limit
        if (remainingLimit < 0) {
          lateDays1++;
          limit = 15; // Reset the limit for the next day
        }
      }
    }
  }

  return { lateDays1, lateDays2, additionalOT };
}
