"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Box,
  Heading,
  Button,
  Link,
  Input,
  VStack,
  Center,
} from "@chakra-ui/react";
import Loading from "@/components/Loading";
import Swal from "sweetalert2";

interface AttendanceDetailsParams {
  employeeId: string;
  month: string;
  year: string;
  attendanceId: string;
}

interface AttendanceDetail {
  index: number;
  attendanceId: number;
  employeeId: number;
  employeeName: string;
  date: string;
  inTime: string;
  outTime: string;
}

export default function AttendanceDetails({
  params,
}: {
  params: AttendanceDetailsParams;
}) {
  const { employeeId, month, year, attendanceId } = params;

  const [attendanceDetails, setAttendanceDetails] = useState<
    AttendanceDetail[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendanceDetails = async () => {
      try {
        const res = await fetch(
          `/api/salary/get-attendance-details/${employeeId}/${month}/${year}/${attendanceId}`,
          {
            method: "GET",
          }
        );
        const data = await res.json();
        setAttendanceDetails(data);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch attendance details", error);
      }
    };

    fetchAttendanceDetails();
  }, [employeeId, month, year, attendanceId]);

  const handleInputChange = (index: number, field: string, value: string) => {
    setAttendanceDetails((prevDetails) =>
      prevDetails.map((attendance: AttendanceDetail, i) =>
        i === index ? { ...attendance, [field]: value } : attendance
      )
    );
  };

  const handleSaveAll = async () => {
    try {
      const result = await Swal.fire({
        title: "Save All",
        text: "Are you sure you want to save all attendance details?",
        icon: "question",
        showCancelButton: true,
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Saving...",
          text: "Please wait while saving attendance details",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const res = await fetch(`/api/attendence/update-attendance-data`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attendanceDetails),
        });

        if (res.ok) {
          Swal.fire({
            title: "Saved!",
            text: "Attendance details saved successfully",
            icon: "success",
          });
        } else {
          Swal.fire({
            title: "Failed!",
            text: "Failed to save attendance details",
            icon: "error",
          });
        }
      }
    } catch (error) {
      console.error("Failed to save attendance details", error);
    }
  };

  return (
    <>
      <Header />
      {loading ? (
        <Loading />
      ) : (
        <Box p={6} bg="gray.50" minH="100vh">
          <Center mb={6}>
            <Heading as="h1" size="xl" textAlign="center" color="teal.600">
              Attendance Details {attendanceId}
            </Heading>
          </Center>
          <TableContainer bg="white" borderRadius="md" boxShadow="md">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Employee ID</Th>
                  <Th>Employee Name</Th>
                  <Th>Date</Th>
                  <Th>In Time</Th>
                  <Th>Out Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {attendanceDetails.map((attendance, i) => (
                  <Tr key={attendance.index}>
                    <Td>
                      <Input
                        value={attendance.employeeId}
                        onChange={(e) =>
                          handleInputChange(i, "employeeId", e.target.value)
                        }
                        size="sm"
                        borderRadius="md"
                      />
                    </Td>
                    <Td>
                      <Input
                        value={attendance.employeeName}
                        onChange={(e) =>
                          handleInputChange(i, "employeeName", e.target.value)
                        }
                        size="sm"
                        borderRadius="md"
                      />
                    </Td>
                    <Td>
                      <Input
                        value={attendance.date}
                        onChange={(e) =>
                          handleInputChange(i, "date", e.target.value)
                        }
                        size="sm"
                        borderRadius="md"
                      />
                    </Td>
                    <Td>
                      <Input
                        value={attendance.inTime}
                        onChange={(e) =>
                          handleInputChange(i, "inTime", e.target.value)
                        }
                        size="sm"
                        borderRadius="md"
                      />
                    </Td>
                    <Td>
                      <Input
                        value={attendance.outTime}
                        onChange={(e) =>
                          handleInputChange(i, "outTime", e.target.value)
                        }
                        size="sm"
                        borderRadius="md"
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
          <VStack spacing={4} align="stretch" mt={6}>
            <Button
              colorScheme="green"
              onClick={handleSaveAll}
              alignSelf="center"
              size="lg"
            >
              Save All
            </Button>
            <Link href="/salary/create-salary" alignSelf="center">
              <Button colorScheme="blue" size="lg">
                Back
              </Button>
            </Link>
          </VStack>
        </Box>
      )}
    </>
  );
}
