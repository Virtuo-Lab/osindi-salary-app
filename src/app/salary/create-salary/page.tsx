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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Input,
  useDisclosure,
} from "@chakra-ui/react";
import Loading from "@/components/Loading";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Employee } from "@/db/schema";

type EmployeeSalary = {
  attendanceId: number;
  employeeId: number;
  employeeName: string;
  month: number;
  year: number;
};

export default function CreateSalary() {
  const [employeeSalary, setEmployeeSalary] = useState<EmployeeSalary[]>([]);
  const [loading, setLoading] = useState(true);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [specialData, setSpecialData] = useState({
    advance: "",
    holidayOfWeek: "",
    specialLeavedays: [] as Date[],
  });
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeSalary | null>(null);

  useEffect(() => {
    const fetchEmployeeSalary = async () => {
      try {
        const res = await fetch("/api/salary/get-salary-available", {
          method: "GET",
        });
        const data = await res.json();
        setEmployeeSalary(data.availableDetails);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch employee salary", error);
      }
    };

    fetchEmployeeSalary();
  }, []);

  const handleCreateSalary = async (
    attendanceId: number,
    employeeId: number,
    month: number,
    year: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Create Salary",
      text: "Are you sure you want to create salary?",
      icon: "question",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Creating...",
        text: "Please wait while creating salary",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await fetch("/api/salary/create-salary", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attendanceId,
            employeeId,
            month,
            year,
          }),
        });

        if (response.ok) {
          const newEmployeeSalary = employeeSalary.filter(
            (item) =>
              item.employeeId !== employeeId &&
              item.month !== month &&
              item.year !== year
          );
          setEmployeeSalary(newEmployeeSalary);

          Swal.fire({
            title: "Salary created",
            text: "Salary has been created successfully",
            icon: "success",
          });
        } else {
          Swal.fire({
            title: "Failed to create salary",
            text: "Failed to create salary",
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "Failed to create salary",
          text: "Failed to create salary",
          icon: "error",
        });
      }
    }
  };

  const handleDeleteSalary = async (
    attendanceId: number,
    employeeId: number,
    month: number,
    year: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    const result = await Swal.fire({
      title: "Delete Salary",
      text: "Are you sure you want to delete salary?",
      icon: "question",
      showCancelButton: true,
    });

    if (result.isConfirmed) {
      Swal.fire({
        title: "Deleting...",
        text: "Please wait while deleting salary",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      try {
        const response = await fetch(
          `/api/attendence/delete-attendance-data/${attendanceId}/${employeeId}`,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              employeeId,
              month,
              year,
            }),
          }
        );

        if (response.ok) {
          console.log(employeeSalary);
          const newEmployeeSalary = employeeSalary.filter(
            (item) =>
              item.attendanceId !== attendanceId ||
              item.employeeId !== employeeId ||
              item.month !== month ||
              item.year !== year
          );
          console.log(newEmployeeSalary);
          setEmployeeSalary(newEmployeeSalary);

          Swal.fire({
            title: "Salary deleted",
            text: "Salary has been deleted successfully",
            icon: "success",
          });
        } else {
          Swal.fire({
            title: "Failed to delete salary",
            text: "Failed to delete salary",
            icon: "error",
          });
        }
      } catch (error) {
        console.error("Failed to delete salary", error);
      }
    }
  };

  const handleSpecialDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSpecialData({
      ...specialData,
      [name]: value,
    });
  };

  const handleDateChange = (date: Date | null) => {
    if (date) {
      const formattedDate = date.toISOString();
      setSpecialData({
        ...specialData,
        specialLeavedays: [...specialData.specialLeavedays, date],
      });
    }
  };

  const handleRemoveDate = (date: Date) => {
    setSpecialData({
      ...specialData,
      specialLeavedays: specialData.specialLeavedays.filter(
        (d) => d.toISOString() !== date.toISOString()
      ),
    });
  };

  const handleSpecialDataSubmit = async () => {
    try {
      if (!selectedEmployee) {
        Swal.fire({
          title: "Error",
          text: "No employee selected",
          icon: "error",
        });
        return;
      }

      const data = {
        ...specialData,
        employeeId: selectedEmployee.employeeId,
        month: selectedEmployee.month,
        year: selectedEmployee.year,
        specialLeavedays: specialData.specialLeavedays.map((date) =>
          date.toISOString()
        ),
      };

      const response = await fetch("/api/attendence/add-special-data", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        Swal.fire({
          title: "Special data added",
          text: "Special data has been added successfully",
          icon: "success",
        });
        onClose();
      } else {
        Swal.fire({
          title: "Failed to add special data",
          text: "Failed to add special data",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Failed to add special data",
        text: "Failed to add special data",
        icon: "error",
      });
    }
  };

  const getSpecialData = async (
    employeeId: number,
    month: number,
    year: number
  ) => {
    try {
      const response = await fetch("/api/attendence/get-special-data", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          employeeId,
          month,
          year,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSpecialData({
          advance: data.Advance,
          holidayOfWeek: data.LeaveDay,
          specialLeavedays: data.SpecialLeaveDay.map(
            (date: string) => new Date(date)
          ),
        });

        console.log(data);
      } else {
        Swal.fire({
          title: "Failed to get special data",
          text: "Failed to get special data",
          icon: "error",
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Failed to get special data",
        text: "Failed to get special data",
        icon: "error",
      });
    }
  };

  return (
    <div>
      <Header />
      {loading ? (
        <Loading />
      ) : (
        <div className="overflow-x-auto ml-12 mr-12 m-2">
          <div>
            <div className="flex justify-between items-center">
              <Heading size="lg" className="mt-4 mb-4">
                Create Salary
              </Heading>
              <Link href="/salary/excel-file">
                <Button colorScheme="teal">CREATE SALARY</Button>
              </Link>
            </div>
          </div>
          <Box p="4" borderWidth={1}>
            <TableContainer>
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Attendance ID</Th>
                    <Th>Employee ID</Th>
                    <Th>Employee Name</Th>
                    <Th>Month</Th>
                    <Th>Year</Th>
                    <Th>Action</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {employeeSalary.map((item) => (
                    <Tr
                      key={item.employeeId + item.month + item.year}
                      onClick={() =>
                        (window.location.href = `/salary/attendance-details/${item.employeeId}/${item.month}/${item.year}/${item.attendanceId}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <Td>{item.attendanceId}</Td>
                      <Td>{item.employeeId}</Td>
                      <Td>{item.employeeName}</Td>
                      <Td>{item.month}</Td>
                      <Td>{item.year}</Td>
                      <Td>
                        <div>
                          <Button
                            margin={2}
                            colorScheme="teal"
                            size="sm"
                            onClick={(e) =>
                              handleCreateSalary(
                                item.attendanceId,
                                item.employeeId,
                                item.month,
                                item.year,
                                e
                              )
                            }
                          >
                            Create Salary
                          </Button>
                          <Button
                            colorScheme="red"
                            size="sm"
                            onClick={(e) =>
                              handleDeleteSalary(
                                item.attendanceId,
                                item.employeeId,
                                item.month,
                                item.year,
                                e
                              )
                            }
                          >
                            Delete
                          </Button>
                          <Button
                            colorScheme="teal"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEmployee(item);
                              getSpecialData(
                                item.employeeId,
                                item.month,
                                item.year
                              );
                              onOpen();
                            }}
                          >
                            Add Special Data
                          </Button>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </TableContainer>
          </Box>
        </div>
      )}

      {/* Modal for adding special attendance data */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Special Attendance Data</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedEmployee && (
              <>
                <p>Employee ID: {selectedEmployee.employeeId}</p>
                <p>Employee Name: {selectedEmployee.employeeName}</p>
                <p>Month: {selectedEmployee.month}</p>
                <p>Year: {selectedEmployee.year}</p>
              </>
            )}

            <Input
              placeholder="Advance"
              name="advance"
              value={specialData.advance}
              onChange={handleSpecialDataChange}
            />
            <Input
              placeholder="Holiday of Week"
              name="holidayOfWeek"
              value={specialData.holidayOfWeek}
              onChange={handleSpecialDataChange}
            />

            <div className="mt-4">
              <DatePicker
                selected={null}
                onChange={handleDateChange}
                filterDate={(date) => {
                  if (selectedEmployee) {
                    const currentMonth = selectedEmployee.month;
                    const currentYear = selectedEmployee.year;
                    return (
                      date.getMonth() + 1 === currentMonth &&
                      date.getFullYear() === currentYear
                    );
                  }
                  return false;
                }}
                placeholderText="Select a date"
              />
              <div className="mt-4">
                {specialData.specialLeavedays.map((date, index) => (
                  <div key={index} className="flex items-center mb-2">
                    <span>{date.toDateString()}</span>
                    <Button
                      colorScheme="red"
                      size="sm"
                      ml={2}
                      onClick={() => handleRemoveDate(date)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSpecialDataSubmit}>
              Submit
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
