"use server";

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Employee } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    await db
      .update(Employee)
      .set({
        name: data.name,
        address: data.address,
        contact: data.contact,
        email: data.email,
        NIC: data.NIC,
        basicSalary: data.basicSalary,
        dutyOnTime: data.dutyOnTime,
        dutyOffTime: data.dutyOffTime,
        remarks: data.remarks,
      })
      .where(eq(Employee.employeeId, data.employeeId));

    return NextResponse.json({ message: "Data updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update data" },
      { status: 500 }
    );
  }
}
