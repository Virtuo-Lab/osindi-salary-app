"use server";

import { NextRequest, NextResponse } from "next/server";
import CreateSalary from "@/function/salary";
import { db } from "@/db";
import { Salary, Deduction, Allowance } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sql } from "drizzle-orm";

interface Deduction {
  deductionTitle: string;
  amount: number;
}

interface Allowance {
  allowanceTitle: string;
  amount: number;
}

export async function POST(req: NextRequest) {
  const { attendanceId, employeeId, month, year } = await req.json();

  let salary = 0;

  const salaryDetails = await CreateSalary(
    attendanceId,
    employeeId,
    month,
    year
  );
  const { salaryOptions, salaryFeatures } = salaryDetails;

  salaryOptions.forEach((option) => {
    if (option.plusOrMinus === "plus") {
      salary += option.amount;
    } else {
      salary -= option.amount;
    }
  });

  const allowanceResult: Allowance[] = await db
    .select({
      allowanceTitle: Allowance.allowanceTitle,
      amount: Allowance.amount,
    })
    .from(Allowance)
    .where(
      and(
        eq(Allowance.employeeId, employeeId),
        eq(Allowance.activeStatus, true)
      )
    );

  const deductionResult: Deduction[] = await db
    .select({
      deductionTitle: Deduction.deductionTitle,
      amount: Deduction.amount,
    })
    .from(Deduction)
    .where(
      and(
        eq(Deduction.employeeId, employeeId),
        eq(Deduction.activeStatus, true)
      )
    );

  const AllowanceJsonObject = allowanceResult.map((allowance) => ({
    title: allowance.allowanceTitle,
    amount: allowance.amount,
  }));

  const DeductionJsonObject = deductionResult.map((deduction) => ({
    title: deduction.deductionTitle,
    amount: deduction.amount,
  }));

  await db.transaction(async (tx) => {
    await tx
      .insert(Salary)
      .values({
        attendanceId: attendanceId,
        employeeId: employeeId,
        month: month,
        year: year,
        advance:
          salaryOptions.find((feature) => feature.title === "Advance")
            ?.amount || 0,
        otHours:
          salaryFeatures.find((feature) => feature.title === "OT Hours")
            ?.amount || 0,
        doubleOtHours:
          salaryFeatures.find((feature) => feature.title === "OT Hours2")
            ?.amount || 0,
        lateDays:
          salaryFeatures.find((feature) => feature.title === "Late Days1")
            ?.amount || 0,
        lateDays2:
          salaryFeatures.find((feature) => feature.title === "Late Days2")
            ?.amount || 0,
        absentDays:
          salaryFeatures.find(
            (feature) => feature.title === "Non Paid Leave Days"
          )?.amount || 0,
        halfDays:
          salaryFeatures.find((feature) => feature.title === "Half Days")
            ?.amount || 0,
        holidays:
          salaryFeatures.find((feature) => feature.title === "Leave Days")
            ?.amount || 0,
        workingHolidays:
          salaryFeatures.find(
            (feature) => feature.title === "Work In Leave Days"
          )?.amount || 0,
        workingDays:
          salaryFeatures.find((feature) => feature.title === "Working Days")
            ?.amount || 0,
        basicSalary:
          salaryOptions.find((options) => options.title === "Basic Salary")
            ?.amount || 0,
        attendanceAllowance:
          salaryOptions.find(
            (options) => options.title === "Attendance Allowance"
          )?.amount || 0,
        allowance: AllowanceJsonObject,
        deduction: DeductionJsonObject,
        otAmount:
          salaryOptions.find((options) => options.title === "OT Amount")
            ?.amount || 0,
        doubleOtAmount:
          salaryOptions.find((options) => options.title === "2OT Amount")
            ?.amount || 0,
        lateAmount:
          salaryOptions.find((options) => options.title === "Late Day1 Amount")
            ?.amount || 0,
        late2Amount:
          salaryOptions.find((options) => options.title === "Late Day2 Amount")
            ?.amount || 0,
        absentAmount:
          salaryOptions.find((options) => options.title === "Absent Amount")
            ?.amount || 0,
        halfDayAmount:
          salaryOptions.find((options) => options.title === "Half Day Amount")
            ?.amount || 0,
        workingHolidayAmount:
          salaryOptions.find(
            (options) => options.title === "Working Leave Day Amount"
          )?.amount || 0,
        totalAllowance:
          salaryFeatures.find((feature) => feature.title === "Total Allowance")
            ?.amount || 0,
        totalDeduction:
          salaryFeatures.find((feature) => feature.title === "Total Deduction")
            ?.amount || 0,
        netSalary: salary,
      })
      .onConflictDoUpdate({
        target: [
          Salary.employeeId,
          Salary.month,
          Salary.year,
          Salary.attendanceId,
        ],
        set: {
          advance: sql`EXCLUDED.advance`,
          otHours: sql`EXCLUDED.ot_hours`,
          doubleOtHours: sql`EXCLUDED.double_ot_hours`,
          lateDays: sql`EXCLUDED.late_days`,
          lateDays2: sql`EXCLUDED.late_days2`,
          absentDays: sql`EXCLUDED.absent_days`,
          halfDays: sql`EXCLUDED.half_days`,
          holidays: sql`EXCLUDED.holidays`,
          workingHolidays: sql`EXCLUDED.working_holidays`,
          workingDays: sql`EXCLUDED.working_days`,
          basicSalary: sql`EXCLUDED.basic_salary`,
          allowance: sql`EXCLUDED.allowance`,
          attendanceAllowance: sql`EXCLUDED.attendance_allowance`,
          deduction: sql`EXCLUDED.deduction`,
          otAmount: sql`EXCLUDED.ot_amount`,
          doubleOtAmount: sql`EXCLUDED.double_ot_amount`,
          lateAmount: sql`EXCLUDED.late_amount`,
          late2Amount: sql`EXCLUDED.late2_amount`,
          absentAmount: sql`EXCLUDED.absent_amount`,
          halfDayAmount: sql`EXCLUDED.half_day_amount`,
          workingHolidayAmount: sql`EXCLUDED.working_holiday_amount`,
          totalAllowance: sql`EXCLUDED.total_allowance`,
          totalDeduction: sql`EXCLUDED.total_deduction`,
          netSalary: sql`EXCLUDED.net_salary`,
        },
      });
  });

  console.log(salaryDetails);
  console.log(salary);
  return NextResponse.json({ salary });
}
