"use server";
import React from "react";
import { basicSalary } from "./salary-rules/basicSallary";
import { allowance } from "./salary-rules/allowance";
import { deduction } from "./salary-rules/deduction";
import { daysForMonth } from "./salary-rules/days";
import { ot } from "./salary-rules/ot";
import { lateDay } from "./salary-rules/lateDay";
import { LeaveDay } from "@/db/schema";
import { LeaveCount } from "./salary-rules/leave";
import { gotLeave } from "./salary-rules/gotLeave";
import { workInLeave } from "./salary-rules/workInLeave";
import { workingDaysForMonth } from "./salary-rules/workingDays";
import { advance } from "./salary-rules/advance";
import { attendanceAllowance } from "./salary-rules/attendanceAllowance";

interface SalaryElement {
  title: string;
  amount: number;
  plusOrMinus: string;
}

interface SalaryFeature {
  title: string;
  amount: number;
}

async function CreateSalary(
  attendanceId: number,
  employeeId: number,
  month: number,
  year: number
) {
  var salaryOptions: SalaryElement[] = [];
  var salaryFeatures: SalaryFeature[] = [];

  console.log("0.1");

  const days = await daysForMonth(attendanceId, employeeId, month, year);

  salaryFeatures.push({
    title: "Days",
    amount: days,
  });

  const workingDays = await workingDaysForMonth(
    attendanceId,
    employeeId,
    month,
    year
  );

  console.log("0.2");

  salaryFeatures.push({
    title: "Working Days",
    amount: workingDays,
  });

  const basic = await basicSalary(employeeId);
  salaryOptions.push({
    title: "Basic Salary",
    amount: basic,
    plusOrMinus: "plus",
  });

  console.log("0.3");

  const allowanceResult = await allowance(employeeId);

  let allowanceAll = 0;
  let deductionAll = 0;

  for (let i = 0; i < allowanceResult.length; i++) {
    salaryOptions.push({
      title: allowanceResult[i].allowanceTitle,
      amount: allowanceResult[i].amount,
      plusOrMinus: "plus",
    });
    allowanceAll += allowanceResult[i].amount;
  }

  console.log("0.4");

  const deductionResult = await deduction(employeeId);

  for (let i = 0; i < deductionResult.length; i++) {
    salaryOptions.push({
      title: deductionResult[i].deductionTitle,
      amount: deductionResult[i].amount,
      plusOrMinus: "minus",
    });
    deductionAll += deductionResult[i].amount;
  }

  console.log("0.5");
  salaryFeatures.push({
    title: "Total Allowance",
    amount: allowanceAll,
  });

  salaryFeatures.push({
    title: "Total Deduction",
    amount: deductionAll,
  });

  const otHours = await ot(attendanceId, employeeId, month, year);

  console.log("0.6");
  salaryFeatures.push({
    title: "OT Hours",
    amount: otHours,
  });

  const lateDayDetails = await lateDay(attendanceId, employeeId, month, year);

  salaryFeatures.push({
    title: "Late Days1",
    amount: lateDayDetails.lateDays1,
  });

  console.log("0.7");
  salaryFeatures.push({
    title: "Late Days2",
    amount: lateDayDetails.lateDays2,
  });

  salaryFeatures.push({
    title: "Additional OT",
    amount: lateDayDetails.additionalOT,
  });
  console.log("0.8");

  const noOfLeaveDays = await LeaveCount(attendanceId, employeeId, month, year);

  salaryFeatures.push({
    title: "Leave Days",
    amount: noOfLeaveDays,
  });

  const gotLeaveDays = await gotLeave(attendanceId, employeeId, month, year);

  salaryFeatures.push({
    title: "Got Leave Days",
    amount: gotLeaveDays,
  });
  let nonPaidLeaveDays = 0;
  if (gotLeaveDays > noOfLeaveDays) {
    nonPaidLeaveDays = gotLeaveDays - noOfLeaveDays;
  }

  if (nonPaidLeaveDays > 0) {
    salaryFeatures.push({
      title: "Non Paid Leave Days",
      amount: nonPaidLeaveDays,
    });
  }

  const monthlyHours = 260;

  const otAmount = (otHours * basic * 1.5) / monthlyHours;

  salaryOptions.push({
    title: "OT Amount",
    amount: otAmount,
    plusOrMinus: "plus",
  });

  const workInLeaveDays = await workInLeave(
    attendanceId,
    employeeId,
    month,
    year
  );

  salaryFeatures.push({
    title: "Work In Leave Days",
    amount: workInLeaveDays,
  });

  const workingLeaveDayAmount =
    workInLeaveDays * (basic / (days - noOfLeaveDays)) * 2;

  salaryOptions.push({
    title: "Working Leave Day Amount",
    amount: workingLeaveDayAmount,
    plusOrMinus: "plus",
  });

  const attendanceAllowanceAmount = await attendanceAllowance(
    lateDayDetails.lateDays1,
    lateDayDetails.lateDays2,
    nonPaidLeaveDays,
    employeeId
  );

  salaryOptions.push({
    title: "Attendance Allowance",
    amount: attendanceAllowanceAmount,
    plusOrMinus: "plus",
  });

  const basicWithAllowance = basic + allowanceAll + attendanceAllowanceAmount;
  const lateDay1Amount =
    (basicWithAllowance / (2 * (workingDays + nonPaidLeaveDays))) *
    lateDayDetails.lateDays1;
  const lateDay2Amount =
    (basicWithAllowance / (workingDays + nonPaidLeaveDays)) *
    lateDayDetails.lateDays2;

  salaryOptions.push({
    title: "Late Day1 Amount",
    amount: lateDay1Amount,
    plusOrMinus: "minus",
  });

  salaryOptions.push({
    title: "Late Day2 Amount",
    amount: lateDay2Amount,
    plusOrMinus: "minus",
  });

  const nonPaidLeaveDaysAmount =
    (basicWithAllowance / (days - noOfLeaveDays)) * nonPaidLeaveDays;

  salaryOptions.push({
    title: "Absent Amount",
    amount: nonPaidLeaveDaysAmount,
    plusOrMinus: "minus",
  });

  const advanceAmount = await advance(employeeId, month, year);

  salaryOptions.push({
    title: "Advance",
    amount: advanceAmount,
    plusOrMinus: "minus",
  });

  return { salaryOptions, salaryFeatures };
}

export default CreateSalary;
