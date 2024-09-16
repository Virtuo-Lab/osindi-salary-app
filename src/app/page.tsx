"use client";
import Header from "@/components/Header";
import {
  Table,
  TableContainer,
  Th,
  Tr,
  Td,
  Thead,
  Tbody,
  Box,
  Heading,
  Button,
  Link,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import Swal from "sweetalert2";

export default function Home() {
  const [salaryData, setSalaryData] = useState([
    {
      index: 0,
      employeeId: 0,
      employeeName: "",
      month: 0,
      year: 0,
      otHours: 0,
      netSalary: 0,
    },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        console.log("Fetching salary data...");
        const res = await fetch("/api/salary/get-salary-list", {
          method: "GET",
        });
        const data = await res.json();
        setSalaryData(data.salaryList);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch salary data", error);
      }
    };

    fetchSalaryData();
  }, []);

  const handlePrint = async (
    index: number,
    employeeId: number,
    month: number,
    year: number,
    e: any
  ) => {
    try {
      console.log("Printing salary...");
      const res = await fetch(`/api/salary/get-pdf`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ index, employeeId, month, year }),
      });
      const data = await res.json();
      console.log(data);

      // Download the PDF
      const downloadLink = document.createElement("a");
      downloadLink.href = `data:application/pdf;base64,${data.base64PDF}`;
      downloadLink.download = `${employeeId}_${year}_${month}.pdf`;
      downloadLink.click();
    } catch (error) {
      console.error("Failed to print salary", error);
    }
  };

  const handleDelete = async (index: number, e: any) => {
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
        text: "Please wait while we delete the salary.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await fetch(`/api/salary/delete-salary/${index}`, {
          method: "DELETE",
        });

        if (response.ok) {
          const newSalaryData = salaryData.filter(
            (salary) => salary.index !== index
          );
          setSalaryData(newSalaryData);
          Swal.fire({
            title: "Deleted!",
            text: "The salary has been deleted.",
            icon: "success",
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to delete the salary.",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Failed to delete salary", error);
      }
    }
  };

  return (
    <div>
      <Header />
      {loading ? (
        <Loading />
      ) : (
        <>
          <div className="overflow-x-auto ml-12 mr-12 m-2">
            <div>
              <div className="flex justify-between items-center">
                <Heading size="lg" className="mt-4 mb-4">
                  Salary
                </Heading>
                <Link href="/salary/create-salary">
                  <Button colorScheme="teal">CREATE SALARY</Button>
                </Link>
              </div>
            </div>
            <Box p="4" borderWidth={1}>
              <TableContainer>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th> Index No</Th>
                      <Th>Employee ID</Th>
                      <Th>Employee Name</Th>
                      <Th>Year</Th>
                      <Th>Month</Th>
                      <Th>OT Hours</Th>
                      <Th>Net Salary</Th>
                      <Th style={{ textAlign: "center" }}>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {salaryData.map((salary) => (
                      <Tr
                        key={salary.index}
                        onClick={() =>
                          (window.location.href = `/salary/salary-details/${salary.index}`)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <Td>{salary.index}</Td>
                        <Td>{salary.employeeId}</Td>
                        <Td>{salary.employeeName}</Td>
                        <Td>{salary.year}</Td>
                        <Td>{salary.month}</Td>
                        <Td>{salary.otHours}</Td>
                        <Td>{salary.netSalary}</Td>
                        <Td
                          style={{
                            display: "flex",
                            gap: "8px",
                            justifyContent: "center",
                          }}
                        >
                          <Button
                            colorScheme="blue"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrint(
                                salary.index,
                                salary.employeeId,
                                salary.month,
                                salary.year,
                                e
                              );
                            }}
                          >
                            Print
                          </Button>
                          <Button
                            colorScheme="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(salary.index, e);
                            }}
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
        </>
      )}
    </div>
  );
}
