import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Attendance } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    await db.transaction(async (tx) => {
      const noOfEntry = data.length;

      const lastIndex = await tx
        .select({
          Id: Attendance.attendanceId,
        })
        .from(Attendance)
        .orderBy(desc(Attendance.index))
        .limit(1);

      let id = 1;

      if (lastIndex.length > 0) {
        id = lastIndex[0].Id == 0 ? 1 : lastIndex[0].Id + 1;
      } else {
        id = 1;
      }

      for (let i = 0; i < noOfEntry; i++) {
        const attendanceData = {
          employeeId: parseInt(data[i].employee_id), // Match with schema
          date: new Date(data[i].date).toISOString(), // Convert to string (ISO format)
          dutyOnTime:
            data[i].duty_on_time !== "empty" ? data[i].duty_on_time : "empty",
          dateOffTime:
            data[i].duty_off_time !== "empty" ? data[i].duty_off_time : "empty", // Correct field name
          month: data[i].month,
          year: data[i].year,
        };

        await tx.insert(Attendance).values({
          attendanceId: id,
          employeeId: attendanceData.employeeId,
          date: attendanceData.date, // Ensure it's a string
          dutyOnTime: attendanceData.dutyOnTime,
          dutyOffTime: attendanceData.dateOffTime, // Match schema field names exactly
          month: attendanceData.month,
          year: attendanceData.year,
        });
      }
    });

    return NextResponse.json({ message: "Data inserted successfully" });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Failed to insert data" },
      { status: 500 }
    );
  }
}
