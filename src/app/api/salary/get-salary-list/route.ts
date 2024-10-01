"use server";

import { Salary, Employee } from "@/db/schema";
import { db } from "@/db";
import { NextResponse, NextRequest } from "next/server";
import { desc, eq, count } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "10", 10);

  const offset = (page - 1) * limit;

  const [salaryList, totalRecords] = await Promise.all([
    db
      .select({
        index: Salary.index,
        employeeId: Salary.employeeId,
        employeeName: Employee.name,
        month: Salary.month,
        year: Salary.year,
        otHours: Salary.otHours,
        netSalary: Salary.netSalary,
      })
      .from(Salary)
      .innerJoin(Employee, eq(Salary.employeeId, Employee.employeeId))
      .limit(limit)
      .offset(offset)
      .orderBy(desc(Salary.index)),

    db.select({ count: count() }).from(Salary), // Get total record count for pagination
  ]);

  const totalPages = Math.ceil(totalRecords[0].count / limit);

  return NextResponse.json({
    salaryList,
    totalPages,
  });
}
