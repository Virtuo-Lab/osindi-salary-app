"use server";

import { db } from "@/db";
import { Deduction } from "@/db/schema";
import { eq, and } from "drizzle-orm";

interface Deduction {
  deductionTitle: string;
  amount: number;
}

export async function deduction(employeeId: number) {
  const deductionResult: Deduction[] = await db
    .select({
      deductionTitle: Deduction.deductionTitle,
      amount: Deduction.amount,
    })
    .from(Deduction)
    .where(
      and(
        eq(Deduction.employeeId, employeeId),
        eq(Deduction.activeStatus, true)
      )
    );

  return deductionResult;
}
