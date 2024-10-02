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
  ButtonGroup,
  Link,
  HStack,
  Text,
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
  const [currentPage, setCurrentPage] = useState(1); // Manage the current page
  const [totalPages, setTotalPages] = useState(1); // Total number of pages
  const recordsPerPage = 10; // Number of records per page

  useEffect(() => {
    const fetchSalaryData = async () => {
      try {
        console.log("Fetching salary data...");
        const res = await fetch(
          `/api/salary/get-salary-list?page=${currentPage}&limit=${recordsPerPage}`
        );
        const data = await res.json();
        setSalaryData(data.salaryList);
        setTotalPages(data.totalPages);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch salary data", error);
      }
    };

    fetchSalaryData();
  }, [currentPage]);

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

  const handleSendEmail = async (
    index: number,
    employeeId: number,
    month: number,
    year: number,
    e: any
  ) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You are about to send an email with the salary details.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, send email!",
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Sending email...",
        text: "Please wait while we send the email.",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await fetch(`/api/salary/send-email`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ index, employeeId, month, year }),
        });

        if (response.ok) {
          Swal.fire({
            title: "Email sent!",
            text: "The salary details have been sent to the employee.",
            icon: "success",
          });
        } else {
          Swal.fire({
            title: "Error!",
            text: "Failed to send the email.",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Failed to send email", error);
      }
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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
                        style={{
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          height: "30px",
                        }} // Reduced font size
                      >
                        <Td style={{ padding: "8px 30px" }}>{salary.index}</Td>{" "}
                        {/* Reduced padding */}
                        <Td style={{ padding: "8px 30px" }}>
                          {salary.employeeId}
                        </Td>
                        <Td style={{ padding: "8px 30px" }}>
                          {salary.employeeName}
                        </Td>
                        <Td style={{ padding: "8px 30px" }}>{salary.year}</Td>
                        <Td style={{ padding: "8px 30px" }}>{salary.month}</Td>
                        <Td style={{ padding: "8px 30px" }}>
                          {salary.otHours}
                        </Td>
                        <Td style={{ padding: "8px 30px" }}>
                          {salary.netSalary}
                        </Td>
                        <Td
                          style={{
                            display: "flex",
                            gap: "4px",
                            justifyContent: "center",
                            padding: "8px", // Reduced padding
                          }}
                        >
                          <Button
                            size="sm" // Reduced button size
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
                            size="sm" // Reduced button size
                            colorScheme="red"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(salary.index, e);
                            }}
                          >
                            Delete
                          </Button>
                          <Button
                            size="sm" // Reduced button size
                            colorScheme="green"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSendEmail(
                                salary.index,
                                salary.employeeId,
                                salary.month,
                                salary.year,
                                e
                              );
                            }}
                          >
                            Send Email
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
              {/* Pagination Controls */}
              <HStack justifyContent="center" spacing={4} mt={4}>
                <Button
                  onClick={handlePreviousPage}
                  isDisabled={currentPage === 1}
                  colorScheme="teal"
                >
                  Previous
                </Button>
                <Text>
                  Page {currentPage} of {totalPages}
                </Text>
                <Button
                  onClick={handleNextPage}
                  isDisabled={currentPage === totalPages}
                  colorScheme="teal"
                >
                  Next
                </Button>
              </HStack>
            </Box>
          </div>
        </>
      )}
    </div>
  );
}
