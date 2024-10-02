"use client";

import React, { useState } from "react";
import Header from "@/components/Header";
import { Box, Heading, Input, Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import Swal from "sweetalert2";
import Link from "next/link";

const SalaryData: React.FC = () => {
  const [employeeName, setEmployeeName] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [address, setAddress] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [NIC, setNIC] = useState<string>("");
  const [basicSalary, setBasicSalary] = useState<number>(0);
  const [dutyOnTime, setDutyOnTime] = useState<string>("");
  const [dutyOffTime, setDutyOffTime] = useState<string>("");
  const [attendanceAllowance, setAttendanceAllowance] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const isFormValid = () => {
    if (
      employeeName.trim() === "" ||
      employeeId === 0 ||
      address.trim() === "" ||
      contact.trim() === "" ||
      email.trim() === "" ||
      NIC.trim() === "" ||
      basicSalary === 0 ||
      dutyOnTime.trim() === "" ||
      dutyOffTime.trim() === ""
    ) {
      return false;
    }
    return true;
  };

  const handleClick = async () => {
    if (!isFormValid()) {
      alert("Please fill all the fields");
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to save this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, save it!",
      cancelButtonText: "No, cancel!",
    });

    if (result.isConfirmed) {
      const data = {
        employeeId: employeeId,
        name: employeeName,
        address: address,
        contact: contact,
        email: email,
        NIC: NIC,
        basicSalary: basicSalary,
        attendanceAllowance: attendanceAllowance,
        dutyOnTime: dutyOnTime,
        dutyOffTime: dutyOffTime,
        remarks: remarks,
      };
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      fetch(`/api/employee/add-employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((result) => {
          // Handle the response
          Swal.fire("Saved!", "Your data has been saved.", "success");
          window.location.href = "/employee";
          console.log(result);
        })
        .catch((error) => {
          // Handle the error
          console.error(error);
        });
    }
  };

  return (
    <div className="h-screen flex flex-col ">
      <Header />
      <div className="mt-8">
        <Heading size="md" className="mt-4 mb-4 flex justify-center">
          Employee Data
        </Heading>
        <div className="flex justify-center">
          <Box className="p-4 bg-white shadow-md rounded-md">
            <div className="flex justify-between">
              <div className="mt-4 mr-4 ml-4">
                <Text className="mb-2 text-gray-700">Employee Name:</Text>
                <Input
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                  placeholder="Add employee name"
                  size="sm"
                  className="border border-gray-300 p-2 rounded-md"
                  required
                />
              </div>
              <div className="mt-4 mr-4 ml-4">
                <Text className="mb-2 text-gray-700">Employee ID:</Text>
                <Input
                  value={employeeId}
                  onChange={(e) => setEmployeeId(Number(e.target.value))}
                  placeholder="Add employee ID"
                  size="sm"
                  className="border border-gray-300 p-2 rounded-md"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between">
              <div className="mt-4 mr-4 ml-4">
                <Text className="mb-2 text-gray-700">Address:</Text>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Add address"
                  size="sm"
                  className="border border-gray-300 p-2 rounded-md"
                  required
                />
              </div>
              <div className="mt-4 mr-4 ml-4">
                <Text className="mb-2 text-gray-700">Contact:</Text>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="Add contact number"
                  size="sm"
                  className="border border-gray-300 p-2 rounded-md"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between">
              <div className="mt-4 mr-4 ml-4">
                <Text className="mb-2 text-gray-700">Email Address:</Text>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Add email address"
                  size="sm"
                  className="border border-gray-300 p-2 rounded-md"
                  required
                />
              </div>
              <div className="mt-4 mr-4 ml-4">
                <Text className="mb-2 text-gray-700">NIC No:</Text>
                <Input
                  value={NIC}
                  onChange={(e) => setNIC(e.target.value)}
                  placeholder="Add NIC number"
                  size="sm"
                  className="border border-gray-300 p-2 rounded-md"
                  required
                />
              </div>
            </div>
            <div className="flex justify-between">
              <div className="mt-4 mr-4 ml-4">
                <Text className="mb-2 text-gray-700">Basic Salary:</Text>
                <Input
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                  placeholder="Add basic salary"
                  size="sm"
                  className="border border-gray-300 p-2 rounded-md"
                  required
                />
              </div>
              <div className="mt-4 mr-4 ml-4">
                <Text className="mb-2 text-gray-700">
                  Attendance Allowance:
                </Text>
                <Input
                  value={attendanceAllowance}
                  onChange={(e) => setAttendanceAllowance(e.target.value)}
                  placeholder="Add remarks"
                  size="sm"
                  className="border border-gray-300 p-2 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-between">
              <div className="mt-4 mr-4 ml-4">
                <Text className="mb-2 text-gray-700">Duty On Time:</Text>
                <Input
                  type="time"
                  value={dutyOnTime}
                  onChange={(e) => setDutyOnTime(e.target.value)}
                  size="sm"
                  className="border border-gray-300 p-2 rounded-md"
                  width="180px"
                  required
                />
              </div>
              <div className="mt-4 mr-4 ml-4">
                <Text className="mb-2 text-gray-700">Duty Off Time:</Text>
                <Input
                  type="time"
                  value={dutyOffTime}
                  onChange={(e) => setDutyOffTime(e.target.value)}
                  size="sm"
                  className="border border-gray-300 p-2 rounded-md"
                  width="180px"
                  required
                />
              </div>
            </div>
            <div className="mt-4 mr-4 ml-4">
              <Text className="mb-2 text-gray-700">Remarks:</Text>
              <Input
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add remarks"
                size="sm"
                className="border border-gray-300 p-2 rounded-md"
              />
            </div>
          </Box>
        </div>

        <div className="flex justify-center mt-4">
          <Button
            colorScheme="teal"
            size="md"
            width="min-content"
            onClick={handleClick}
          >
            Submit
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalaryData;
