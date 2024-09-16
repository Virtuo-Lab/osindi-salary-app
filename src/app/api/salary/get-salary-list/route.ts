"use server";

import { Salary, Employee } from "@/db/schema";
import { db } from "@/db";
import { NextResponse, NextRequest } from "next/server";
import { desc, eq } from "drizzle-orm";

export async function GET(NextRequest: NextRequest) {
  const salaryList = await db
    .select({
      index: Salary.index,
      employeeId: Salary.employeeId,
      employeeName: Employee.name, // Assuming the Employee table has a 'name' column
      month: Salary.month,
      year: Salary.year,
      otHours: Salary.otHours,
      netSalary: Salary.netSalary,
    })
    .from(Salary)
    .innerJoin(Employee, eq(Salary.employeeId, Employee.employeeId))
    .limit(20)
    .orderBy(desc(Salary.index));

  return NextResponse.json({ salaryList });
}
