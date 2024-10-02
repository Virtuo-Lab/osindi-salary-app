import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Attendance } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    await db.transaction(async (tx) => {
      const noOfEntry = data.length;

      for (let i = 0; i < noOfEntry; i++) {
        const attendanceData = {
          attendanceId: parseInt(data[i].attendanceId),
          employeeId: parseInt(data[i].employeeId),
          date: new Date(data[i].date).toISOString(),
          dutyOnTime: data[i].inTime !== "empty" ? data[i].inTime : "empty",
          dutyOffTime: data[i].outTime !== "empty" ? data[i].outTime : "empty",
          month: new Date(data[i].date).getMonth() + 1,
          year: new Date(data[i].date).getFullYear(),
        };

        await tx
          .update(Attendance)
          .set({
            dutyOnTime: attendanceData.dutyOnTime,
            dutyOffTime: attendanceData.dutyOffTime,
          })
          .where(
            and(
              eq(Attendance.employeeId, attendanceData.employeeId),
              eq(Attendance.date, attendanceData.date),
              eq(Attendance.month, attendanceData.month),
              eq(Attendance.year, attendanceData.year),
              eq(Attendance.attendanceId, attendanceData.attendanceId)
            )
          );
      }
    });

    return NextResponse.json({ message: "Data updated successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to update data" },
      { status: 500 }
    );
  }
}
