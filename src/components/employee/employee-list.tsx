"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import {
  Table,
  Thead,
  Tbody,
  Tfoot,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
  Box,
  Heading,
} from "@chakra-ui/react";

//employee list from get employee list api
const EmployeeDataList: React.FC = () => {
  const [employeeList, setEmployeeList] = useState<any[]>([]);

  const fetchEmployeeList = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`${baseUrl}/api/employee/get-employee-list`);
    const data = await response.json();
    setEmployeeList(data);
  };

  useEffect(() => {
    fetchEmployeeList();
  }, []);

  return (
    <div className="overflow-x-auto m-12">
      <Box p="4" borderWidth={1}>
        <Heading size="md" className="mt-4 mb-4 flex justify-center">
          Employee List
        </Heading>
        <TableContainer>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Employee ID</Th>
                <Th>Name</Th>
                <Th>Address</Th>
                <Th>Contact</Th>
                <Th>Duty On Time</Th>
                <Th>Duty Off Time</Th>
              </Tr>
            </Thead>
            <Tbody>
              {employeeList.map((employee) => (
                <Tr
                  key={employee.employeeId}
                  onClick={() =>
                    (window.location.href = `/employee/employee-details/${employee.employeeId}`)
                  }
                  style={{ cursor: "pointer" }}
                >
                  <Td>{employee.employeeId}</Td>
                  <Td>{employee.name}</Td>
                  <Td>{employee.address}</Td>
                  <Td>{employee.contact}</Td>
                  <Td>{employee.dutyOnTime}</Td>
                  <Td>{employee.dutyOffTime}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </Box>
    </div>
  );
};

export default EmployeeDataList;
