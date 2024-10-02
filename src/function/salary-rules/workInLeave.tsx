"use server";

import { LeaveCount } from "./leave";
import { gotLeave } from "./gotLeave";

export async function workInLeave(
  attendanceId: number,
  employeeId: number,
  month: number,
  year: number
) {
  const workingLeave =
    (await LeaveCount(attendanceId, employeeId, month, year)) -
    (await gotLeave(attendanceId, employeeId, month, year));

  console.log("workingLeave", workingLeave);
  console.log(
    "LeaveCount",
    await LeaveCount(attendanceId, employeeId, month, year)
  );
  console.log(
    "gotLeave",
    await gotLeave(attendanceId, employeeId, month, year)
  );

  if (workingLeave < 0) {
    return 0;
  }

  return workingLeave;
}
