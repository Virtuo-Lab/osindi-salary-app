"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Employee } from "@/db/schema";
import { eq } from "drizzle-orm";
import { attendanceAllowance } from "@/function/salary-rules/attendanceAllowance";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.pathname.split("/").pop(); // Extract the ID from the URL

  const employee = await db
    .select({
      employeeId: Employee.employeeId,
      name: Employee.name,
      address: Employee.address,
      contact: Employee.contact,
      email: Employee.email,
      NIC: Employee.NIC,
      basicSalary: Employee.basicSalary,
      attendanceAllowance: Employee.attendanceAllowance,
      dutyOnTime: Employee.dutyOnTime,
      dutyOffTime: Employee.dutyOffTime,
      remarks: Employee.remarks,
    })
    .from(Employee)
    .where(eq(Employee.employeeId, Number(id))); // Use the extracted ID

  return NextResponse.json(employee[0]);
}
