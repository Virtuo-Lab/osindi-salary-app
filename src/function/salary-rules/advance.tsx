"use server";

import { db } from "@/db";
import { Advance } from "@/db/schema";
import { eq, and, sum } from "drizzle-orm";

export async function advance(employeeId: number, month: number, year: number) {
  const result = await db
    .select({
      totalAdvance: sum(Advance.amount),
    })
    .from(Advance)
    .where(
      and(
        eq(Advance.employeeId, employeeId),
        eq(Advance.month, month),
        eq(Advance.year, year)
      )
    );

  if (result.length === 0 || result[0].totalAdvance === null) {
    return 0;
  } else {
    const totalAdvance: number = parseInt(result[0].totalAdvance) ?? 0;
    return totalAdvance;
  }
}
