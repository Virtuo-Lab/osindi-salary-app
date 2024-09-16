import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Employee } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    await db.insert(Employee).values({
      employeeId: data.employeeId,
      name: data.employeeName,
      address: data.address,
      contact: data.contact,
      email: data.email,
      NIC: data.NIC,
      basicSalary: data.basicSalary,
      dutyOnTime: data.dutyOnTime,
      dutyOffTime: data.dutyOffTime,
      remarks: data.remarks,
    });

    return NextResponse.json({ message: "Data inserted successfully" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to insert data" },
      { status: 500 }
    );
  }
}
