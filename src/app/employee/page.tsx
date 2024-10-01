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
} from "@chakra-ui/react";
import Link from "next/link";
import Loading from "@/components/Loading";
import Swal from "sweetalert2";

const EmployeeData: React.FC = () => {
  const [employeeList, setEmployeeList] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchEmployeeList = async () => {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`/api/employee/get-employee-list`);
    const data = await response.json();
    setEmployeeList(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchEmployeeList();
  }, []);

  const handleDelete = async (employeeId: number, e: any) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleting...",
        text: "Please wait while we delete the employee.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const response = await fetch(
        `/api/employee/delete-employee/${employeeId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        fetchEmployeeList();
        Swal.fire({
          title: "Deleted!",
          text: "The employee has been deleted.",
          icon: "success",
        });
      } else {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete the employee.",
          icon: "error",
        });
      }
    }
  };

  return (
    <div>
      <Header />
      <div className="overflow-x-auto ml-12 mr-12 m-2">
        {loading && <Loading />}
        <div>
          <div className="flex justify-between items-center">
            <Heading size="lg" className="mt-4 mb-4">
              Employee
            </Heading>
            <Link href="/employee/employee-data" passHref>
              <Button colorScheme="teal">ADD EMPLOYEE</Button>
            </Link>
          </div>
        </div>
        <Box p="4" borderWidth={1}>
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
                  <Th style={{ textAlign: "center" }}>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {employeeList.map((employee) => (
                  <Tr
                    key={employee.employeeId}
                    onClick={() =>
                      (window.location.href = `/employee/employee-details/${employee.employeeId}`)
                    }
                    style={{
                      cursor: "pointer",
                      fontSize: "0.875rem",
                      height: "30px",
                    }}
                  >
                    <Td style={{ padding: "8px 30px" }}>
                      {employee.employeeId}
                    </Td>
                    <Td style={{ padding: "8px 30px" }}>{employee.name}</Td>
                    <Td style={{ padding: "8px 30px" }}>{employee.address}</Td>
                    <Td style={{ padding: "8px 30px" }}>{employee.contact}</Td>
                    <Td style={{ padding: "8px 30px" }}>
                      {employee.dutyOnTime}
                    </Td>
                    <Td style={{ padding: "8px 30px" }}>
                      {employee.dutyOffTime}
                    </Td>
                    <Td
                      style={{
                        padding: "8px 30px",
                        display: "flex",
                        gap: "4px",
                        justifyContent: "center",
                      }}
                    >
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={(e) => handleDelete(employee.employeeId, e)}
                      >
                        Delete
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </div>
    </div>
  );
};

export default EmployeeData;
