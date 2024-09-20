import { advance } from "@/function/salary-rules/advance";
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  serial,
  text,
  varchar,
  uniqueIndex,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";

export const Employee = pgTable("employees", {
  index: serial("index_no").unique(),
  employeeId: integer("employee_id").primaryKey(),
  name: varchar("name", { length: 64 }).notNull(),
  address: varchar("address", { length: 64 }),
  contact: varchar("contact", { length: 16 }).unique(),
  email: varchar("email", { length: 64 }).unique(),
  NIC: varchar("nic", { length: 16 }).unique(),
  basicSalary: doublePrecision("basic_salary").notNull(),
  attendanceAllowance: doublePrecision("attendance_allowance")
    .notNull()
    .default(2000),
  dutyOnTime: varchar("duty_on_time").notNull(),
  dutyOffTime: varchar("duty_off_time").notNull(),
  remarks: text("remarks"),
});

export const Attendance = pgTable(
  "attendance",
  {
    index: serial("index_no").primaryKey(),
    attendanceId: integer("attendance_id").notNull(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => Employee.employeeId),
    date: varchar("date").notNull(),
    dutyOnTime: varchar("duty_on_time").notNull(),
    dutyOffTime: varchar("duty_off_time").notNull(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
  },
  (table) => ({
    employeeDateIdx: uniqueIndex("employee_date_idx").on(
      table.attendanceId,
      table.employeeId,
      table.date
    ),
  })
);

export const AttendanceSummary = pgTable("attendance_summary", {
  index: serial("index_no").primaryKey(),

  employeeId: integer("employee_id")
    .notNull()
    .references(() => Employee.employeeId),
  month: integer("month").notNull(),
  otHours: doublePrecision("ot_hours").notNull(),
  lateDays: integer("late_days").notNull(),
  absentDays: integer("absent_days").notNull(),
  halfDays: integer("half_days").notNull(),
  holidays: integer("holidays").notNull(),
  workingHolidays: integer("working_holidays").notNull(),
  doubleOtHours: doublePrecision("double_ot_hours").notNull(),
  workingDays: integer("working_days").notNull(),
});

export const Allowance = pgTable("allowance", {
  index: serial("index_no").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => Employee.employeeId),
  allowanceTitle: varchar("allowance_title", { length: 64 }).notNull(),
  amount: doublePrecision("amount").notNull(),
  activeStatus: boolean("active_status").notNull(),
  modifiedDate: timestamp("modified_date").notNull(),
  createdDate: timestamp("created_date").notNull(),
});

export const Deduction = pgTable("deduction", {
  index: serial("index_no").primaryKey(),
  employeeId: integer("employee_id")
    .notNull()
    .references(() => Employee.employeeId),
  deductionTitle: varchar("deduction_title", { length: 64 }).notNull(),
  amount: doublePrecision("amount").notNull(),
  activeStatus: boolean("active_status").notNull(),
  modifiedDate: timestamp("modified_date").notNull(),
  createdDate: timestamp("created_date").notNull(),
});

export const AllowanceSummary = pgTable("allowance_summary", {
  index: serial("index_no").primaryKey(),
  allowanceIndex: integer("allowance_index")
    .notNull()
    .references(() => Allowance.index),
  month: integer("month").notNull(),
});

export const DeductionSummary = pgTable("deduction_summary", {
  index: serial("index_no").primaryKey(),
  deductionIndex: integer("deduction_index")
    .notNull()
    .references(() => Deduction.index),
  month: integer("month").notNull(),
});

export const LeaveDay = pgTable(
  "leave_day",
  {
    index: serial("index_no").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => Employee.employeeId),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    day: varchar("day").notNull(),
  },
  (table) => ({
    employeeDateIdx: uniqueIndex("leave_day_employee_month_idx").on(
      table.employeeId,
      table.month,
      table.year
    ),
  })
);

export const SpecialLeaveDay = pgTable(
  "special_leave_day",
  {
    index: serial("index_no").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => Employee.employeeId),
    date: varchar("date").notNull(),
    reason: text("reason"),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
  },
  (table) => ({
    employeeDateIdx: uniqueIndex("special_leave_day_employee_month_idx").on(
      table.employeeId,
      table.month,
      table.year,
      table.date
    ),
  })
);

export const Salary = pgTable(
  "salary",
  {
    index: serial("index_no").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => Employee.employeeId),
    attendanceId: integer("attendance_id").notNull(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    advance: doublePrecision("advance").notNull(),
    otHours: doublePrecision("ot_hours").notNull(),
    doubleOtHours: doublePrecision("double_ot_hours").notNull(),
    lateDays: integer("late_days").notNull(),
    lateDays2: integer("late_days2").notNull(),
    absentDays: integer("absent_days").notNull(),
    halfDays: integer("half_days").notNull(),
    holidays: integer("holidays").notNull(),
    workingHolidays: integer("working_holidays").notNull(),
    workingDays: integer("working_days").notNull(),
    basicSalary: doublePrecision("basic_salary").notNull(),
    attendanceAllowance: doublePrecision("attendance_allowance").notNull(),
    allowance: jsonb("allowance").notNull(),
    deduction: jsonb("deduction").notNull(),
    otAmount: doublePrecision("ot_amount").notNull(),
    doubleOtAmount: doublePrecision("double_ot_amount").notNull(),
    lateAmount: doublePrecision("late_amount").notNull(),
    late2Amount: doublePrecision("late2_amount").notNull(),
    absentAmount: doublePrecision("absent_amount").notNull(),
    halfDayAmount: doublePrecision("half_day_amount").notNull(),
    workingHolidayAmount: doublePrecision("working_holiday_amount").notNull(),
    totalAllowance: doublePrecision("total_allowance").notNull(),
    totalDeduction: doublePrecision("total_deduction").notNull(),
    netSalary: doublePrecision("net_salary").notNull(),
    isEmailSent: boolean("is_email_sent"),
  },
  (table) => ({
    employeeDateIdx: uniqueIndex("salary_employee_month_idx").on(
      table.employeeId,
      table.month,
      table.year,
      table.attendanceId
    ),
  })
);

export const Advance = pgTable(
  "advance",
  {
    index: serial("index_no").primaryKey(),
    employeeId: integer("employee_id")
      .notNull()
      .references(() => Employee.employeeId),

    amount: doublePrecision("amount").notNull(),
    month: integer("month").notNull(),
    year: integer("year").notNull(),
    date: timestamp("created_date").notNull(),
    modifiedDate: timestamp("modified_date").notNull(),
    remark: text("remark"),
  },
  (table) => ({
    employeeDateIdx: uniqueIndex("advance_employee_month_idx").on(
      table.employeeId,
      table.month,
      table.year
    ),
  })
);
