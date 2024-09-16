import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { Advance, LeaveDay, SpecialLeaveDay } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    await db.transaction(async (tx) => {
      // Upsert into LeaveDay for the holiday of the week
      await tx
        .insert(LeaveDay)
        .values({
          employeeId: data.employeeId,
          month: data.month,
          year: data.year,
          day: data.holidayOfWeek,
        })
        .onConflictDoUpdate({
          target: [LeaveDay.employeeId, LeaveDay.month, LeaveDay.year],
          set: {
            day: data.holidayOfWeek, // Update the day
          },
        });

      // Upsert into Advance
      await tx
        .insert(Advance)
        .values({
          employeeId: data.employeeId,
          month: data.month,
          year: data.year,
          amount: parseFloat(data.advance), // Convert to number
          remark: "Advance Payment",
          date: new Date(),
          modifiedDate: new Date(),
        })
        .onConflictDoUpdate({
          target: [Advance.employeeId, Advance.month, Advance.year],
          set: {
            amount: parseFloat(data.advance),
            remark: "Advance Payment",
            modifiedDate: new Date(),
          },
        });

      // Process Special Leave Days
      for (const specialLeaveDay of data.specialLeavedays) {
        const date = new Date(specialLeaveDay);
        await tx
          .insert(SpecialLeaveDay)
          .values({
            employeeId: data.employeeId,
            month: data.month,
            year: data.year,
            date: date.toISOString(), // Ensure date is in ISO format
            reason: "Special Leave",
          })
          .onConflictDoUpdate({
            target: [
              SpecialLeaveDay.employeeId,
              SpecialLeaveDay.date,
              SpecialLeaveDay.month,
              SpecialLeaveDay.year,
            ],
            set: {
              reason: "Special Leave", // Update the reason if conflict occurs
            },
          });
      }
    });

    return NextResponse.json({ message: "Data upserted successfully" });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to upsert data" },
      { status: 500 }
    );
  }
}
