"use server";

import { db } from "@/db";
import { Employee } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function basicSalary(employeeId: number) {
  const basic = await db
    .select({
      basicSalary: Employee.basicSalary,
    })
    .from(Employee)
    .where(eq(Employee.employeeId, employeeId));

  return basic[0].basicSalary;
}
