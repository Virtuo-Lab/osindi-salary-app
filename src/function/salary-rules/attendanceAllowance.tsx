"use server";

import { db } from "@/db";
import { Employee } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { daysForMonth } from "./days";

export async function attendanceAllowance(
  lateDays1: number,
  lateDays2: number,
  noOfLeaveDays: number,
  employeeId: number
) {
  if (lateDays1 > 0 || lateDays2 > 0 || noOfLeaveDays > 0) {
    return 0;
  } else {
    const allowance = await db
      .select({
        allowance: Employee.attendanceAllowance,
      })
      .from(Employee)
      .where(eq(Employee.employeeId, employeeId));

    return allowance[0].allowance;
  }
}
