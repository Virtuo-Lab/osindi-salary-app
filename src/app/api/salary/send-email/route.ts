// src/app/api/send-test-email/route.ts
import { db } from "@/db";
import { Employee } from "@/db/schema";
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { eq } from "drizzle-orm";
import { GeneratePDF } from "@/function/salaryPDF";

export async function POST(req: Request) {
  const { index, employeeId, month, year } = await req.json();

  const Email = await db
    .select({ email: Employee.email })
    .from(Employee)
    .where(eq(Employee.employeeId, employeeId));

  const recipientEmail = Email[0]?.email;
  const subject = `Salary Details for ${month}/${year}`;
  const text = `Dear Employee,\n\nYour salary details for the month of ${month}/${year} are attached below.\n\nThank you.`;

  const base64ofPDFAttachment = await GeneratePDF(
    employeeId,
    month,
    year,
    index
  );

  if (!recipientEmail || !subject || !text || !base64ofPDFAttachment) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  try {
    // Create a transporter object using Outlook SMTP
    const transporter = nodemailer.createTransport({
      service: "Outlook365", // Use 'Outlook365' for Outlook
      auth: {
        user: process.env.EMAIL_USER, // Your Outlook email address
        pass: process.env.EMAIL_PASS, // Your Outlook email password or app password
      },
    });

    // Send email with PDF attachment
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipientEmail,
      subject: subject,
      text: text,
      attachments: [
        {
          filename: `SalaryDetails_${employeeId}_${month}_${year}.pdf`,
          content: base64ofPDFAttachment,
          encoding: "base64",
        },
      ],
    });

    return NextResponse.json(
      { message: "Email sent successfully with attachment" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
