"use server";

import { db } from "@/db";
import { LeaveDay, SpecialLeaveDay } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function LeaveCount(
  attendanceId: number,
  employeeId: number,
  month: number,
  year: number
) {
  // Fetch leave days (days of the week) for the given employee, month, and year
  const leaveDays = await db
    .select({
      day: LeaveDay.day,
    })
    .from(LeaveDay)
    .where(
      and(
        eq(LeaveDay.employeeId, employeeId),
        eq(LeaveDay.month, month),
        eq(LeaveDay.year, year)
      )
    );

  // Fetch special leave days (specific dates) for the given employee, month, and year
  const specialLeaveDays = await db
    .select({
      date: SpecialLeaveDay.date,
    })
    .from(SpecialLeaveDay)
    .where(
      and(
        eq(SpecialLeaveDay.employeeId, employeeId),
        eq(SpecialLeaveDay.month, month),
        eq(SpecialLeaveDay.year, year)
      )
    );

  // Map day names to JavaScript Date weekday numbers (0 = Sunday, 1 = Monday, etc.)
  const dayMap: Record<string, number> = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  // Function to count the number of specific weekdays in a given month and year
  function countWeekdaysInMonth(
    year: number,
    month: number,
    weekday: number
  ): number {
    let count = 0;
    const date = new Date(year, month - 1, 1); // month is 0-indexed in JavaScript Date

    while (date.getMonth() === month - 1) {
      if (date.getDay() === weekday) {
        count++;
      }
      date.setDate(date.getDate() + 1);
    }

    return count;
  }

  // Calculate the total number of leave days based on the weekdays
  let leaveDayCounts = 0;
  const specialLeaveDatesSet = new Set(
    specialLeaveDays.map(({ date }) => date.toString().split("T")[0])
  );

  leaveDays.forEach(({ day }) => {
    const dayOfWeek = dayMap[day];
    if (dayOfWeek !== undefined) {
      const date = new Date(year, month - 1, 1);
      while (date.getMonth() === month - 1) {
        if (date.getDay() === dayOfWeek) {
          const dateString = date.toISOString().split("T")[0];
          // Only add to leaveDayCounts if it's not a special leave day
          if (!specialLeaveDatesSet.has(dateString)) {
            leaveDayCounts++;
          }
        }
        date.setDate(date.getDate() + 1);
      }
    }
  });

  console.log("leaveDayCounts", leaveDayCounts);

  // Add special leave days to the count (since they aren't double-counted)
  leaveDayCounts += specialLeaveDays.length;

  return leaveDayCounts;
}
