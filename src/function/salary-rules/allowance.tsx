"use server";

import { db } from "@/db";
import { Allowance } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface Allowance {
  allowanceTitle: string;
  amount: number;
}

export async function allowance(employeeId: number) {
  const allowanceResult: Allowance[] = await db
    .select({
      allowanceTitle: Allowance.allowanceTitle,
      amount: Allowance.amount,
    })
    .from(Allowance)
    .where(
      and(
        eq(Allowance.employeeId, employeeId),
        eq(Allowance.activeStatus, true)
      )
    );

  return allowanceResult;
}
