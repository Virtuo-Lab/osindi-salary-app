"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Loading from "@/components/Loading";
import { VStack, HStack, Grid, GridItem, Divider } from "@chakra-ui/react";
import {
  Box,
  Heading,
  useColorModeValue,
  Text,
  Center,
} from "@chakra-ui/react";

const SalaryDetails: React.FC = () => {
  const [salary, setSalary] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSalary = async () => {
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const id = window.location.pathname.split("/").pop();
      const response = await fetch(`/api/salary/get-salary/${id}`);
      const data = await response.json();
      setSalary(data);
      setLoading(false);
    };

    fetchSalary();
  }, []);

  const boxBgColor = useColorModeValue("gray.50", "gray.700");
  const sectionBgColor = useColorModeValue("blue.50", "blue.700");

  return (
    <div>
      <Header />
      {loading ? (
        <Loading />
      ) : (
        <Center mt="8">
          <Box
            p="6"
            bg={boxBgColor}
            borderRadius="md"
            boxShadow="md"
            maxW="800px"
            mt="8"
          >
            <Heading as="h1" size="lg" mb="4" textAlign="center">
              Salary Details
            </Heading>

            <Grid templateColumns="repeat(2, 1fr)" gap={6}>
              {/* Left Column */}
              <GridItem>
                {/* Employee Info */}
                <VStack spacing="4" align="start">
                  <Text>
                    <strong>Employee Name:</strong> {salary.employeeName}
                  </Text>
                  <HStack>
                    <Text>
                      <strong>Month:</strong> {salary.month}
                    </Text>
                    <Text>
                      <strong>Year:</strong> {salary.year}
                    </Text>
                  </HStack>
                </VStack>

                <Divider my="4" />

                {/* Days Related Info */}
                <Box p="4" bg={sectionBgColor} borderRadius="md">
                  <Heading as="h2" size="md" mb="2">
                    Days Information
                  </Heading>
                  <VStack spacing="4" align="start">
                    <Text>
                      <strong>OT Hours:</strong> {salary.otHours}
                    </Text>
                    <Text>
                      <strong>Double OT Hours:</strong> {salary.doubleOtHours}
                    </Text>
                    <Text>
                      <strong>Late Days:</strong> {salary.lateDays}
                    </Text>
                    <Text>
                      <strong>Late Days 2:</strong> {salary.lateDays2}
                    </Text>
                    <Text>
                      <strong>Absent Days:</strong> {salary.absentDays}
                    </Text>
                    <Text>
                      <strong>Half Days:</strong> {salary.halfDays}
                    </Text>
                    <Text>
                      <strong>Holidays:</strong> {salary.holidays}
                    </Text>
                    <Text>
                      <strong>Working Holidays:</strong>{" "}
                      {salary.workingHolidays}
                    </Text>
                    <Text>
                      <strong>Working Days:</strong> {salary.workingDays}
                    </Text>
                  </VStack>
                </Box>
              </GridItem>

              {/* Right Column */}
              <GridItem>
                {/* Salary and Allowances */}
                <VStack spacing="4" align="start">
                  <Text>
                    <strong>Basic Salary:</strong> {salary.basicSalary}
                  </Text>
                  <Text>
                    <strong>Attendance Allowance:</strong>{" "}
                    {salary.attendanceAllowance}
                  </Text>
                  {salary.allowance &&
                    salary.allowance.map((allowance: any) => (
                      <Text key={allowance.index}>
                        <strong>{allowance.title}:</strong> {allowance.amount}
                      </Text>
                    ))}
                  <Text>
                    <strong>OT Amount:</strong> {salary.otAmount}
                  </Text>
                  <Text>
                    <strong>Double OT Amount:</strong> {salary.doubleOtAmount}
                  </Text>
                </VStack>

                <Divider my="4" />

                {/* Deductions */}
                <Box p="4" bg={sectionBgColor} borderRadius="md">
                  <Heading as="h2" size="md" mb="2">
                    Deductions
                  </Heading>
                  <VStack spacing="4" align="start">
                    {salary.deduction &&
                      salary.deduction.map((deduction: any) => (
                        <Text key={deduction.index}>
                          <strong>{deduction.title}:</strong> {deduction.amount}
                        </Text>
                      ))}
                    <Text>
                      <strong>Advance:</strong> {salary.advance}
                    </Text>
                    <Text>
                      <strong>Late Amount:</strong> {salary.lateAmount}
                    </Text>
                    <Text>
                      <strong>Late 2 Amount:</strong> {salary.late2Amount}
                    </Text>
                    <Text>
                      <strong>Absent Amount:</strong> {salary.absentAmount}
                    </Text>
                    <Text>
                      <strong>Half Day Amount:</strong> {salary.halfDayAmount}
                    </Text>
                  </VStack>
                </Box>

                <Divider my="4" />

                {/* Net Salary */}
                <Text fontSize="xl" fontWeight="bold">
                  Net Salary:{" "}
                  <span style={{ color: "green" }}>{salary.netSalary}</span>
                </Text>
              </GridItem>
            </Grid>
          </Box>
        </Center>
      )}
    </div>
  );
};

export default SalaryDetails;
