"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Salary, Employee } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop();

  const salary = await db
    .select({
      employeeId: Salary.employeeId,
      employeeName: Employee.name,
      month: Salary.month,
      year: Salary.year,
      otHours: Salary.otHours,
      doubleOtHours: Salary.doubleOtHours,
      lateDays: Salary.lateDays,
      lateDays2: Salary.lateDays2,
      absentDays: Salary.absentDays,
      halfDays: Salary.halfDays,
      holidays: Salary.holidays,
      workingHolidays: Salary.workingHolidays,
      workingDays: Salary.workingDays,
      basicSalary: Salary.basicSalary,
      attendanceAllowance: Salary.attendanceAllowance,
      allowance: Salary.allowance,
      deduction: Salary.deduction,
      otAmount: Salary.otAmount,
      doubleOtAmount: Salary.doubleOtAmount,
      lateAmount: Salary.lateAmount,
      late2Amount: Salary.late2Amount,
      absentAmount: Salary.absentAmount,
      halfDayAmount: Salary.halfDayAmount,
      workingHolidayAmount: Salary.workingHolidayAmount,
      totalAllowance: Salary.totalAllowance,
      totalDeduction: Salary.totalDeduction,
      netSalary: Salary.netSalary,
      advance: Salary.advance,
    })
    .from(Salary)
    .innerJoin(Employee, eq(Salary.employeeId, Employee.employeeId))
    .where(eq(Salary.index, Number(id)));

  return NextResponse.json(salary[0]);
}
