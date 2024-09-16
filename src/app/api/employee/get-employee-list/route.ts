"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Employee } from "@/db/schema";

export async function GET(req: NextRequest) {
  const employeeList = await db
    .select({
      employeeId: Employee.employeeId,
      name: Employee.name,
      address: Employee.address,
      contact: Employee.contact,
      email: Employee.email,
      NIC: Employee.NIC,
      basicSalary: Employee.basicSalary,
      dutyOnTime: Employee.dutyOnTime,
      dutyOffTime: Employee.dutyOffTime,
      remarks: Employee.remarks,
    })
    .from(Employee);

  return NextResponse.json(employeeList);
}
// Compare this snippet from osindi-sallary-app/src/app/api/employee/get-employee-list/route.ts:
