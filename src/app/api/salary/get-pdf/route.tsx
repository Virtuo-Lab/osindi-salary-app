"use server";

import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { db } from "@/db";
import { Salary, Employee, Allowance, Deduction, Advance } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { employeeId, month, year } = await req.json();

  // Fetch salary details from the database
  const salaryDetails = await db
    .select({
      employeeId: Salary.employeeId,
      month: Salary.month,
      year: Salary.year,
      otHours: Salary.otHours,
      doubleOtHours: Salary.doubleOtHours,
      lateDays: Salary.lateDays,
      lateDays2: Salary.lateDays2,
      absentDays: Salary.absentDays,
      halfDays: Salary.halfDays,
      holidays: Salary.holidays,
      workingHolidays: Salary.workingHolidays,
      workingDays: Salary.workingDays,
      basicSalary: Salary.basicSalary,
      attendanceAllowance: Salary.attendanceAllowance,
      allowance: Salary.allowance,
      deduction: Salary.deduction,
      otAmount: Salary.otAmount,
      doubleOtAmount: Salary.doubleOtAmount,
      lateAmount: Salary.lateAmount,
      late2Amount: Salary.late2Amount,
      absentAmount: Salary.absentAmount,
      halfDayAmount: Salary.halfDayAmount,
      workingHolidayAmount: Salary.workingHolidayAmount,
      totalAllowance: Salary.totalAllowance,
      totalDeduction: Salary.totalDeduction,
      netSalary: Salary.netSalary,
    })
    .from(Salary)
    .where(
      and(
        eq(Salary.employeeId, employeeId),
        eq(Salary.month, month),
        eq(Salary.year, year)
      )
    );

  const advance = await db
    .select({
      amount: Advance.amount,
    })
    .from(Advance)
    .where(eq(Advance.employeeId, employeeId));

  const allowance = await db
    .select({
      allowanceTitle: Allowance.allowanceTitle,
      amount: Allowance.amount,
    })
    .from(Allowance)
    .where(eq(Allowance.employeeId, employeeId));

  const deduction = await db
    .select({
      deductionTitle: Deduction.deductionTitle,
      amount: Deduction.amount,
    })
    .from(Deduction)
    .where(eq(Deduction.employeeId, employeeId));

  const employeeName = await db
    .select({
      name: Employee.name,
    })
    .from(Employee)
    .where(eq(Employee.employeeId, employeeId));

  if (salaryDetails.length === 0) {
    return NextResponse.json(
      { error: "No salary details found." },
      { status: 404 }
    );
  }

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([400, 800]); // Decreased width for better layout
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const desFontSize = 12;
  const desLineHeight = 12;
  const desHeight = 20;

  // Title
  const title = "OSINDI PHARMACY";
  const titleWidth = font.widthOfTextAtSize(title, 24);
  const titleX = (width - titleWidth) / 2;
  const titleY = height - 30;
  page.drawText(title, {
    x: titleX,
    y: titleY,
    size: 24,
    font: boldFont,
    color: rgb(0, 0, 0),
    lineHeight: 24,
  });

  const monthNames = [
    "",
    "JANUARY",
    "FEBRUARY",
    "MARCH",
    "APRIL",
    "MAY",
    "JUNE",
    "JULY",
    "AUGUST",
    "SEPTEMBER",
    "OCTOBER",
    "NOVEMBER",
    "DECEMBER",
  ];
  const monthName = monthNames[Number(salaryDetails[0].month)];
  const year2 = salaryDetails[0].year;

  const paySheetText = `${year2} ${monthName} PAY SHEET`;
  const paySheetWidth = font.widthOfTextAtSize(paySheetText, 14);
  const paySheetX = (width - paySheetWidth) / 2;
  const paySheetY = height - 70;
  page.drawText(paySheetText, {
    x: paySheetX,
    y: paySheetY,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
    lineHeight: 18,
  });

  const employeeNameText = employeeName[0].name;
  const employeeNameWidth = font.widthOfTextAtSize(employeeNameText, 14);
  const employeeNameX = (width - employeeNameWidth) / 2;
  const employeeNameY = height - 100;
  page.drawText(employeeNameText, {
    x: employeeNameX,
    y: employeeNameY,
    size: 18,
    font: boldFont,
    color: rgb(0, 0, 0),
    lineHeight: 18,
  });

  // Add salary details to the PDF
  const workingDaysText = `Working Days: ${salaryDetails[0].workingDays}`;
  const leaveDaysText = `Leave Days: ${salaryDetails[0].holidays}`;
  const workingDaysWidth = font.widthOfTextAtSize(workingDaysText, 12);
  const leaveDaysWidth = font.widthOfTextAtSize(leaveDaysText, 12);
  const workingDaysX = 50;
  const leaveDaysX = width - leaveDaysWidth - 50;
  const workingDaysY = height - 150;
  const leaveDaysY = height - 150;
  page.drawText(workingDaysText, {
    x: workingDaysX,
    y: workingDaysY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(leaveDaysText, {
    x: leaveDaysX,
    y: leaveDaysY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  // Add a line break before the basic salary
  const lineBreakY = height - 160;
  page.drawLine({
    start: { x: 50, y: lineBreakY },
    end: { x: width - 50, y: lineBreakY },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  // Add basic salary to the PDF
  const basicTitle = "Basic Salary";
  const basicEmpty = " ";
  const basicAmount = `${salaryDetails[0].basicSalary}`;

  const basicTitleWidth = font.widthOfTextAtSize(basicTitle, 12);
  const basicEmptyWidth = font.widthOfTextAtSize(basicEmpty, 12);
  const basicAmountWidth = font.widthOfTextAtSize(basicAmount, 12);

  const basicTitleX = 50;
  const basicEmptyX = 50;
  const basicAmountX = width - basicAmountWidth - 50;

  const basicTitleY = height - 180;
  const basicEmptyY = height - 180;
  const basicAmountY = height - 180;

  page.drawText(basicTitle, {
    x: basicTitleX,
    y: basicTitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(basicEmpty, {
    x: basicEmptyX,
    y: basicEmptyY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(basicAmount, {
    x: basicAmountX,
    y: basicAmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  //add attendance allowance to the PDF
  const attendanceTitle = "Attendance Allowance";
  const attendanceEmpty = " ";
  const attendanceAmount = `${salaryDetails[0].attendanceAllowance}`;

  const attendanceTitleWidth = font.widthOfTextAtSize(attendanceTitle, 12);
  const attendanceEmptyWidth = font.widthOfTextAtSize(attendanceEmpty, 12);
  const attendanceAmountWidth = font.widthOfTextAtSize(attendanceAmount, 12);

  const attendanceTitleX = 50;
  const attendanceEmptyX = 50;
  const attendanceAmountX = width - attendanceAmountWidth - 50;

  const attendanceTitleY = height - 200;
  const attendanceEmptyY = height - 200;
  const attendanceAmountY = height - 200;

  page.drawText(attendanceTitle, {
    x: attendanceTitleX,
    y: attendanceTitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(attendanceEmpty, {
    x: attendanceEmptyX,
    y: attendanceEmptyY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(attendanceAmount, {
    x: attendanceAmountX,
    y: attendanceAmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  //add other allowances to the PDF
  for (let i = 0; i < allowance.length; i++) {
    const allowanceTitle = allowance[i].allowanceTitle;
    const allowanceEmpty = " ";
    const allowanceAmount = `${allowance[i].amount}`;

    const allowanceTitleWidth = font.widthOfTextAtSize(
      allowanceTitle,
      desFontSize
    );
    const allowanceEmptyWidth = font.widthOfTextAtSize(
      allowanceEmpty,
      desFontSize
    );
    const allowanceAmountWidth = font.widthOfTextAtSize(
      allowanceAmount,
      desFontSize
    );

    const allowanceTitleX = 50;
    const allowanceEmptyX = 50;
    const allowanceAmountX = width - allowanceAmountWidth - 50;

    const allowanceTitleY = height - 220 - i * desHeight;
    const allowanceEmptyY = height - 220 - i * desHeight;
    const allowanceAmountY = height - 220 - i * desHeight;

    page.drawText(allowanceTitle, {
      x: allowanceTitleX,
      y: allowanceTitleY,
      size: desFontSize,
      font: font,
      color: rgb(0, 0, 0),
      lineHeight: desLineHeight,
    });
    page.drawText(allowanceEmpty, {
      x: allowanceEmptyX,
      y: allowanceEmptyY,
      size: desFontSize,
      font: font,
      color: rgb(0, 0, 0),
      lineHeight: desLineHeight,
    });
    page.drawText(allowanceAmount, {
      x: allowanceAmountX,
      y: allowanceAmountY,
      size: desFontSize,
      font: font,
      color: rgb(0, 0, 0),
      lineHeight: desLineHeight,
    });
  }

  // Add a line break before the total allowance
  const lineBreakY2 = height - 240 - allowance.length * desHeight;
  page.drawLine({
    start: { x: 50, y: lineBreakY2 },
    end: { x: width - 50, y: lineBreakY2 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  //add total since basic salary to the PDF
  const totalAllowanceTitle = "Total Allowance";
  const totalAllowanceEmpty = " ";
  const totalAllowanceAmount = `${
    salaryDetails[0].basicSalary +
    salaryDetails[0].attendanceAllowance +
    salaryDetails[0].totalAllowance
  } `;

  const totalAllowanceTitleWidth = font.widthOfTextAtSize(
    totalAllowanceTitle,
    12
  );
  const totalAllowanceEmptyWidth = font.widthOfTextAtSize(
    totalAllowanceEmpty,
    12
  );
  const totalAllowanceAmountWidth = font.widthOfTextAtSize(
    totalAllowanceAmount,
    12
  );

  const totalAllowanceTitleX = 50;
  const totalAllowanceEmptyX = 50;
  const totalAllowanceAmountX = width - totalAllowanceAmountWidth - 50;

  const totalAllowanceTitleY = height - 260 - allowance.length * desHeight;
  const totalAllowanceEmptyY = height - 260 - allowance.length * desHeight;
  const totalAllowanceAmountY = height - 260 - allowance.length * desHeight;

  page.drawText(totalAllowanceTitle, {
    x: totalAllowanceTitleX,
    y: totalAllowanceTitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(totalAllowanceEmpty, {
    x: totalAllowanceEmptyX,
    y: totalAllowanceEmptyY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(totalAllowanceAmount, {
    x: totalAllowanceAmountX,
    y: totalAllowanceAmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  // Add overtime details to the PDF
  const otTitle = "Overtime";
  const otHoursText = `${salaryDetails[0].otHours} hours`;
  const otAmountText = `${salaryDetails[0].otAmount}`;

  const otTitleWidth = font.widthOfTextAtSize(otTitle, 12);
  const otHoursWidth = font.widthOfTextAtSize(otHoursText, 12);
  const otAmountWidth = font.widthOfTextAtSize(otAmountText, 12);

  const otTitleX = 50;
  const otHoursX = otTitleX + otTitleWidth + 40; // Adjusted X position for otHours
  const otAmountX = width - otAmountWidth - 50;

  const otTitleY = height - 280 - allowance.length * desHeight;
  const otHoursY = otTitleY;
  const otAmountY = otTitleY;

  page.drawText(otTitle, {
    x: otTitleX,
    y: otTitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  page.drawText(otHoursText, {
    x: otHoursX,
    y: otHoursY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  page.drawText(otAmountText, {
    x: otAmountX,
    y: otAmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  // Add working holidays details to the PDF
  const workingHolidayTitle = "Working Holidays";
  const workingHolidayCount = `${salaryDetails[0].workingHolidays}`;
  const workingHolidayAmountText = `${salaryDetails[0].workingHolidayAmount}`;

  const workingHolidayTitleWidth = font.widthOfTextAtSize(
    workingHolidayTitle,
    12
  );
  const workingHolidayCountWidth = font.widthOfTextAtSize(
    workingHolidayCount,
    12
  );
  const workingHolidayAmountWidth = font.widthOfTextAtSize(
    workingHolidayAmountText,
    12
  );

  const workingHolidayTitleX = 50;
  const workingHolidayCountX =
    workingHolidayTitleX + workingHolidayTitleWidth + 40; // Adjusted X position for workingHolidayCount
  const workingHolidayAmountX = width - workingHolidayAmountWidth - 50;

  const workingHolidayTitleY = height - 300 - allowance.length * desHeight;
  const workingHolidayCountY = workingHolidayTitleY;
  const workingHolidayAmountY = workingHolidayTitleY;

  page.drawText(workingHolidayTitle, {
    x: workingHolidayTitleX,
    y: workingHolidayTitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  page.drawText(workingHolidayCount, {
    x: workingHolidayCountX,
    y: workingHolidayCountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  page.drawText(workingHolidayAmountText, {
    x: workingHolidayAmountX,
    y: workingHolidayAmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  //add a line break before the total basic+allowance+overtime+workingLeaveDay
  const lineBreakY3 = height - 320 - allowance.length * desHeight;
  page.drawLine({
    start: { x: 50, y: lineBreakY3 },
    end: { x: width - 50, y: lineBreakY3 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  //add total since basic salary to the PDF
  const totalSalaryTitle = "Total Salary";
  const totalSalaryEmpty = " ";
  const totalSalaryAmount = `${
    salaryDetails[0].basicSalary +
    salaryDetails[0].attendanceAllowance +
    salaryDetails[0].totalAllowance +
    salaryDetails[0].otAmount +
    salaryDetails[0].workingHolidayAmount
  } `;
  const totalSalaryTitleWidth = font.widthOfTextAtSize(totalSalaryTitle, 12);
  const totalSalaryEmptyWidth = font.widthOfTextAtSize(totalSalaryEmpty, 12);
  const totalSalaryAmountWidth = font.widthOfTextAtSize(totalSalaryAmount, 12);
  const totalSalaryTitleX = 50;
  const totalSalaryEmptyX = 50;
  const totalSalaryAmountX = width - totalSalaryAmountWidth - 50;
  const totalSalaryTitleY = height - 340 - allowance.length * desHeight;
  const totalSalaryEmptyY = height - 340 - allowance.length * desHeight;
  const totalSalaryAmountY = height - 340 - allowance.length * desHeight;
  page.drawText(totalSalaryTitle, {
    x: totalSalaryTitleX,
    y: totalSalaryTitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(totalSalaryEmpty, {
    x: totalSalaryEmptyX,
    y: totalSalaryEmptyY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(totalSalaryAmount, {
    x: totalSalaryAmountX,
    y: totalSalaryAmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  // Add a line break before the deductions
  const lineBreakY4 = height - 360 - allowance.length * desHeight;
  page.drawLine({
    start: { x: 50, y: lineBreakY4 },
    end: { x: width - 50, y: lineBreakY4 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  //add deductions to the PDF
  for (let i = 0; i < deduction.length; i++) {
    const deductionTitle = deduction[i].deductionTitle;
    const deductionEmpty = " ";
    const deductionAmount = `${deduction[i].amount}`;

    const deductionTitleWidth = font.widthOfTextAtSize(
      deductionTitle,
      desFontSize
    );
    const deductionEmptyWidth = font.widthOfTextAtSize(
      deductionEmpty,
      desFontSize
    );
    const deductionAmountWidth = font.widthOfTextAtSize(
      deductionAmount,
      desFontSize
    );

    const deductionTitleX = 50;
    const deductionEmptyX = 50;
    const deductionAmountX = width - deductionAmountWidth - 50;

    const deductionTitleY =
      height - 380 - allowance.length * desHeight - i * desHeight;
    const deductionEmptyY =
      height - 380 - allowance.length * desHeight - i * desHeight;
    const deductionAmountY =
      height - 380 - allowance.length * desHeight - i * desHeight;

    page.drawText(deductionTitle, {
      x: deductionTitleX,
      y: deductionTitleY,
      size: desFontSize,
      font: font,
      color: rgb(0, 0, 0),
      lineHeight: desLineHeight,
    });
    page.drawText(deductionEmpty, {
      x: deductionEmptyX,
      y: deductionEmptyY,
      size: desFontSize,
      font: font,
      color: rgb(0, 0, 0),
      lineHeight: desLineHeight,
    });
    page.drawText(deductionAmount, {
      x: deductionAmountX,
      y: deductionAmountY,
      size: desFontSize,
      font: font,
      color: rgb(0, 0, 0),
      lineHeight: desLineHeight,
    });
  }

  // add half day deduction to the PDF
  const halfDayTitle = "Half Day Deduction";
  const halfDayEmpty = " ";
  const halfDayAmount = `(${salaryDetails[0].halfDayAmount})`;

  const halfDayTitleWidth = font.widthOfTextAtSize(halfDayTitle, 12);
  const halfDayEmptyWidth = font.widthOfTextAtSize(halfDayEmpty, 12);
  const halfDayAmountWidth = font.widthOfTextAtSize(halfDayAmount, 12);

  const halfDayTitleX = 50;
  const halfDayEmptyX = 50;
  const halfDayAmountX = width - halfDayAmountWidth - 50;

  const halfDayTitleY =
    height - 400 - allowance.length * desHeight - deduction.length * desHeight;
  const halfDayEmptyY =
    height - 400 - allowance.length * desHeight - deduction.length * desHeight;
  const halfDayAmountY =
    height - 400 - allowance.length * desHeight - deduction.length * desHeight;

  page.drawText(halfDayTitle, {
    x: halfDayTitleX,
    y: halfDayTitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(halfDayEmpty, {
    x: halfDayEmptyX,
    y: halfDayEmptyY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(halfDayAmount, {
    x: halfDayAmountX,
    y: halfDayAmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  //add late day deduction to the PDF
  const lateDayTitle = "Late Day Deduction";
  const lateDayEmpty = " ";
  const lateDayAmount = `(${salaryDetails[0].lateAmount})`;

  const lateDayTitleWidth = font.widthOfTextAtSize(lateDayTitle, 12);
  const lateDayEmptyWidth = font.widthOfTextAtSize(lateDayEmpty, 12);
  const lateDayAmountWidth = font.widthOfTextAtSize(lateDayAmount, 12);

  const lateDayTitleX = 50;
  const lateDayEmptyX = 50;
  const lateDayAmountX = width - lateDayAmountWidth - 50;

  const lateDayTitleY =
    height - 420 - allowance.length * desHeight - deduction.length * desHeight;
  const lateDayEmptyY =
    height - 420 - allowance.length * desHeight - deduction.length * desHeight;
  const lateDayAmountY =
    height - 420 - allowance.length * desHeight - deduction.length * desHeight;

  page.drawText(lateDayTitle, {
    x: lateDayTitleX,
    y: lateDayTitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(lateDayEmpty, {
    x: lateDayEmptyX,
    y: lateDayEmptyY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(lateDayAmount, {
    x: lateDayAmountX,
    y: lateDayAmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  //add lateday2 deduction to the PDF
  const lateDay2Title = "Late Day2 Deduction";
  const lateDay2Empty = " ";
  const lateDay2Amount = `(${salaryDetails[0].late2Amount})`;

  const lateDay2TitleWidth = font.widthOfTextAtSize(lateDay2Title, 12);
  const lateDay2EmptyWidth = font.widthOfTextAtSize(lateDay2Empty, 12);
  const lateDay2AmountWidth = font.widthOfTextAtSize(lateDay2Amount, 12);

  const lateDay2TitleX = 50;
  const lateDay2EmptyX = 50;
  const lateDay2AmountX = width - lateDay2AmountWidth - 50;

  const lateDay2TitleY =
    height - 440 - allowance.length * desHeight - deduction.length * desHeight;
  const lateDay2EmptyY =
    height - 440 - allowance.length * desHeight - deduction.length * desHeight;
  const lateDay2AmountY =
    height - 440 - allowance.length * desHeight - deduction.length * desHeight;

  page.drawText(lateDay2Title, {
    x: lateDay2TitleX,
    y: lateDay2TitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(lateDay2Empty, {
    x: lateDay2EmptyX,
    y: lateDay2EmptyY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(lateDay2Amount, {
    x: lateDay2AmountX,
    y: lateDay2AmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  //add absent day deduction to the PDF
  const absentDayTitle = "Absent Day Deduction";
  const absentDayEmpty = " ";
  const absentDayAmount = `(${salaryDetails[0].absentAmount})`;

  const absentDayTitleWidth = font.widthOfTextAtSize(absentDayTitle, 12);
  const absentDayEmptyWidth = font.widthOfTextAtSize(absentDayEmpty, 12);
  const absentDayAmountWidth = font.widthOfTextAtSize(absentDayAmount, 12);

  const absentDayTitleX = 50;
  const absentDayEmptyX = 50;
  const absentDayAmountX = width - absentDayAmountWidth - 50;

  const absentDayTitleY =
    height - 460 - allowance.length * desHeight - deduction.length * desHeight;
  const absentDayEmptyY =
    height - 460 - allowance.length * desHeight - deduction.length * desHeight;
  const absentDayAmountY =
    height - 460 - allowance.length * desHeight - deduction.length * desHeight;

  page.drawText(absentDayTitle, {
    x: absentDayTitleX,
    y: absentDayTitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(absentDayEmpty, {
    x: absentDayEmptyX,
    y: absentDayEmptyY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(absentDayAmount, {
    x: absentDayAmountX,
    y: absentDayAmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  //add advance deduction to the PDF
  const advanceTitle = "Advance Deduction";
  const advanceEmpty = " ";
  const advanceAmount = `(${advance[0].amount})`;

  const advanceTitleWidth = font.widthOfTextAtSize(advanceTitle, 12);
  const advanceEmptyWidth = font.widthOfTextAtSize(advanceEmpty, 12);
  const advanceAmountWidth = font.widthOfTextAtSize(advanceAmount, 12);

  const advanceTitleX = 50;
  const advanceEmptyX = 50;
  const advanceAmountX = width - advanceAmountWidth - 50;

  const advanceTitleY =
    height - 480 - allowance.length * desHeight - deduction.length * desHeight;
  const advanceEmptyY =
    height - 480 - allowance.length * desHeight - deduction.length * desHeight;
  const advanceAmountY =
    height - 480 - allowance.length * desHeight - deduction.length * desHeight;

  page.drawText(advanceTitle, {
    x: advanceTitleX,
    y: advanceTitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(advanceEmpty, {
    x: advanceEmptyX,
    y: advanceEmptyY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(advanceAmount, {
    x: advanceAmountX,
    y: advanceAmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  //add a line break before the total deduction
  const lineBreakY5 =
    height - 500 - allowance.length * desHeight - deduction.length * desHeight;
  page.drawLine({
    start: { x: 50, y: lineBreakY5 },
    end: { x: width - 50, y: lineBreakY5 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  //add total deduction to the PDF
  const totalDeductionTitle = "Total Deduction";
  const totalDeductionEmpty = " ";
  const totalDeductionAmount = `${
    salaryDetails[0].totalDeduction +
    salaryDetails[0].halfDayAmount +
    salaryDetails[0].lateAmount +
    salaryDetails[0].late2Amount +
    salaryDetails[0].absentAmount +
    advance[0].amount
  } `;
  const totalDeductionTitleWidth = font.widthOfTextAtSize(
    totalDeductionTitle,
    12
  );
  const totalDeductionEmptyWidth = font.widthOfTextAtSize(
    totalDeductionEmpty,
    12
  );
  const totalDeductionAmountWidth = font.widthOfTextAtSize(
    totalDeductionAmount,
    12
  );
  const totalDeductionTitleX = 50;
  const totalDeductionEmptyX = 50;
  const totalDeductionAmountX = width - totalDeductionAmountWidth - 50;
  const totalDeductionTitleY =
    height - 520 - allowance.length * desHeight - deduction.length * desHeight;
  const totalDeductionEmptyY =
    height - 520 - allowance.length * desHeight - deduction.length * desHeight;
  const totalDeductionAmountY =
    height - 520 - allowance.length * desHeight - deduction.length * desHeight;
  page.drawText(totalDeductionTitle, {
    x: totalDeductionTitleX,
    y: totalDeductionTitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(totalDeductionEmpty, {
    x: totalDeductionEmptyX,
    y: totalDeductionEmptyY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(totalDeductionAmount, {
    x: totalDeductionAmountX,
    y: totalDeductionAmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  // Add a line break before the net salary
  const lineBreakY6 =
    height - 540 - allowance.length * desHeight - deduction.length * desHeight;
  page.drawLine({
    start: { x: 50, y: lineBreakY6 },
    end: { x: width - 50, y: lineBreakY6 },
    thickness: 1,
    color: rgb(0, 0, 0),
  });

  //add net salary to the PDF
  const netSalaryTitle = "Net Salary";
  const netSalaryEmpty = " ";
  const netSalaryAmount = `${salaryDetails[0].netSalary} `;
  const netSalaryTitleWidth = font.widthOfTextAtSize(netSalaryTitle, 12);
  const netSalaryEmptyWidth = font.widthOfTextAtSize(netSalaryEmpty, 12);
  const netSalaryAmountWidth = font.widthOfTextAtSize(netSalaryAmount, 12);
  const netSalaryTitleX = 50;
  const netSalaryEmptyX = 50;
  const netSalaryAmountX = width - netSalaryAmountWidth - 50;
  const netSalaryTitleY =
    height - 560 - allowance.length * desHeight - deduction.length * desHeight;
  const netSalaryEmptyY =
    height - 560 - allowance.length * desHeight - deduction.length * desHeight;
  const netSalaryAmountY =
    height - 560 - allowance.length * desHeight - deduction.length * desHeight;
  page.drawText(netSalaryTitle, {
    x: netSalaryTitleX,
    y: netSalaryTitleY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(netSalaryEmpty, {
    x: netSalaryEmptyX,
    y: netSalaryEmptyY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });
  page.drawText(netSalaryAmount, {
    x: netSalaryAmountX,
    y: netSalaryAmountY,
    size: 12,
    font: font,
    color: rgb(0, 0, 0),
    lineHeight: 12,
  });

  // Convert PDF to base64
  const pdfBytes = await pdfDoc.save();
  const base64PDF = Buffer.from(pdfBytes).toString("base64");

  // Return the PDF as a base64-encoded string
  return NextResponse.json({ base64PDF });
}
