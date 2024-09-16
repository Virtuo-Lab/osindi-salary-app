"use client";

import React, { useState, useEffect } from "react";
// Adding required imports for Date Picker
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import * as XLSX from "xlsx";
import {
  ChakraProvider,
  Button,
  Box,
  Heading,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Editable,
  EditableInput,
  EditablePreview,
  Text,
  Select,
  HStack,
  Checkbox,
  CheckboxGroup,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import Header from "@/components/Header";
import Swal from "sweetalert2";
import Link from "next/link";

type AttendanceRecord = {
  employee_id: number;
  date: string;
  duty_on_time: string;
  duty_off_time: string;
  month: number;
  year: number;
};

const ExcelFilePage: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jsonData, setJsonData] = useState<AttendanceRecord[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<number | null>(
    null
  );
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [showAllRows, setShowAllRows] = useState<boolean>(false);

  useEffect(() => {
    if (jsonData.length > 0 && selectedEmployeeId === null) {
      setSelectedEmployeeId(jsonData[0].employee_id);
    }
  }, [jsonData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const processExcelFile = () => {
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target!.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: "array" });

      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      const attendanceRecords: AttendanceRecord[] = [];
      const daysInMonth: Record<number, Set<string>> = {}; // Track dates for each employee
      let currentRecord: AttendanceRecord | null =
        null as AttendanceRecord | null;

      (rows as any[][]).forEach((row: any[], index: number) => {
        const employeeId = row[0];
        const dutyStatus = row[4];
        const timestamp = row[7];

        if (
          typeof employeeId !== "number" ||
          !dutyStatus ||
          typeof timestamp !== "number"
        ) {
          return;
        }

        const date = new Date((timestamp - 25569) * 86400 * 1000)
          .toISOString()
          .split("T")[0];

        if (!daysInMonth[employeeId]) {
          daysInMonth[employeeId] = new Set();
        }

        daysInMonth[employeeId].add(date);

        if (dutyStatus === "DutyOn") {
          if (
            currentRecord &&
            currentRecord.employee_id === employeeId &&
            currentRecord.duty_off_time === "" &&
            currentRecord.duty_on_time != "empty" &&
            currentRecord.duty_on_time != "" &&
            currentRecord.duty_on_time != null
          ) {
            currentRecord.duty_off_time = "empty";
            attendanceRecords.push(currentRecord);
            console.log("Duty On", currentRecord);
          }
          currentRecord = {
            employee_id: employeeId,
            date: date,
            duty_on_time: new Date(
              (timestamp - 25569) * 86400 * 1000
            ).toISOString(),
            duty_off_time: "",
            month: new Date(date).getMonth() + 1,
            year: new Date(date).getFullYear(),
          };
          console.log("Duty On2", currentRecord);
        } else if (dutyStatus === "DutyOff") {
          console.log("Duty Off", currentRecord);
          if (
            currentRecord &&
            currentRecord.employee_id === employeeId &&
            currentRecord.date === date &&
            currentRecord.duty_off_time != "empty" &&
            currentRecord.duty_off_time
          ) {
            currentRecord.duty_on_time = currentRecord.duty_off_time;
          }

          if (
            currentRecord &&
            currentRecord.employee_id === employeeId &&
            currentRecord.date === date
          ) {
            currentRecord.duty_off_time = new Date(
              (timestamp - 25569) * 86400 * 1000
            ).toISOString();
            attendanceRecords.push(currentRecord);
            currentRecord = null;
          } else {
            currentRecord = {
              employee_id: employeeId,
              date: date,
              duty_on_time: "empty",
              duty_off_time: new Date(
                (timestamp - 25569) * 86400 * 1000
              ).toISOString(),
              month: new Date(date).getMonth() + 1,
              year: new Date(date).getFullYear(),
            };
            attendanceRecords.push(currentRecord);
            currentRecord = null;
          }
        }
      });

      if (currentRecord && currentRecord.duty_off_time) {
        attendanceRecords.push(currentRecord);
      }

      // Filter and fill missing days only for the selected start month
      const selectedMonth = new Date(attendanceRecords[0].date).getMonth(); // Get the month of the first record
      const filteredRecords = attendanceRecords.filter(
        (record) => new Date(record.date).getMonth() === selectedMonth
      );

      Object.entries(daysInMonth).forEach(([employeeId, recordedDays]) => {
        const employeeRecords = filteredRecords.filter(
          (record) => record.employee_id === Number(employeeId)
        );
        if (employeeRecords.length > 0) {
          const startDate = new Date(employeeRecords[0].date);
          startDate.setDate(1);
          const endDate = new Date(
            employeeRecords[employeeRecords.length - 1].date
          );
          endDate.setMonth(endDate.getMonth() + 1);
          endDate.setDate(0);
          for (
            let d = new Date(startDate);
            d <= endDate;
            d.setDate(d.getDate() + 1)
          ) {
            const dateStr = d.toISOString().split("T")[0];
            if (
              new Date(dateStr).getMonth() === selectedMonth &&
              !recordedDays.has(dateStr)
            ) {
              filteredRecords.push({
                employee_id: Number(employeeId),
                date: dateStr,
                duty_on_time: "empty",
                duty_off_time: "empty",
                month: d.getMonth() + 1,
                year: d.getFullYear(),
              });
            }
          }
        }
      });

      filteredRecords.sort(
        (a, b) =>
          a.employee_id - b.employee_id ||
          new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      //remove duplicate rows with same employee_id and date
      const uniqueRecords = filteredRecords.filter(
        (record, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.employee_id === record.employee_id && t.date === record.date
          )
      );

      setJsonData(uniqueRecords);
      console.log(
        "Final Filtered Attendance Records:",
        JSON.stringify(filteredRecords, null, 2)
      );
    };

    reader.onerror = (error) => {
      console.error("Error processing Excel file:", error);
    };

    reader.readAsArrayBuffer(file);
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleChange = (
    index: number,
    field: keyof AttendanceRecord,
    value: string
  ) => {
    const updatedData = [...jsonData];
    const date = new Date(value);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    updatedData[index] = {
      ...updatedData[index],
      [field]: value,
      month: month,
      year: year,
    };
    setJsonData(updatedData);
  };

  const uniqueEmployeeIds = Array.from(
    new Set(jsonData.map((record) => record.employee_id))
  );

  const filteredData = jsonData.filter(
    (record) => record.employee_id === selectedEmployeeId
  );

  // Limit the number of rows displayed
  const displayedData = showAllRows ? filteredData : filteredData.slice(0, 10);

  const saveData = async () => {
    try {
      const result = await Swal.fire({
        title: "Save Data",
        text: "Are you sure you want to save data?",
        icon: "question",
        showCancelButton: true,
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: "Saving...",
          text: "Please wait while saving data",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

        const response = await fetch(
          `${baseUrl}/api/attendence/add-attendence-data`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(jsonData),
          }
        );

        if (response.ok) {
          Swal.fire({
            title: "Saved!",
            text: "Data saved successfully",
            icon: "success",
          });

          window.location.href = "/salary/create-salary";
        } else {
          Swal.fire({
            title: "Failed!",
            text: "Failed to save data",
            icon: "error",
          });
        }
      }
    } catch (error) {
      console.error("Failed to save data", error);
      Swal.fire({
        title: "Failed!",
        text: "Failed to save data",
        icon: "error",
      });
    }
  };

  return (
    <ChakraProvider>
      <Header />
      <div className=" ">
        <Box className="p-4 bg-white shadow-md rounded-md">
          <HStack mb={4} p={4} bg="gray.50" borderRadius="md" shadow="sm">
            <Heading size="md" className="mt-4 mb-4 mr-10 flex justify-center">
              Import Excel File
            </Heading>
            <Input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              flex="1"
            />
            <Button colorScheme="blue" onClick={processExcelFile}>
              Process File
            </Button>
          </HStack>
          <div className="flex flex-col items-center">
            <HStack
              mb={4}
              p={4}
              maxW="400px"
              bg="gray.50"
              borderRadius="md"
              shadow="sm"
              width="100%"
            >
              <Select
                placeholder="Select Employee ID"
                value={selectedEmployeeId ?? ""}
                onChange={(e) => setSelectedEmployeeId(Number(e.target.value))}
                flex="1"
              >
                {uniqueEmployeeIds.map((employeeId) => (
                  <option key={employeeId} value={employeeId}>
                    Employee ID: {employeeId}
                  </option>
                ))}
              </Select>
              <Button
                colorScheme={isEditing ? "red" : "blue"}
                onClick={handleEditToggle}
              >
                {isEditing ? "Stop Editing" : "Edit"}
              </Button>
            </HStack>

            <Box
              maxH="500px"
              maxW="1500px"
              overflowY="auto"
              border="1px solid gray"
              borderRadius="md"
              p={2}
              width="100%"
            >
              <Table variant="simple">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Duty On Time</Th>
                    <Th>Duty Off Time</Th>
                    <Th>Date</Th>
                    <Th>Duty On Time</Th>
                    <Th>Duty Off Time</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {displayedData.reduce<JSX.Element[]>(
                    (rows, record, index) => {
                      if (index % 2 === 0) {
                        rows.push(
                          <Tr key={index}>
                            <Td>
                              {isEditing ? (
                                <Editable
                                  defaultValue={record.date}
                                  onSubmit={(value) =>
                                    handleChange(index, "date", value)
                                  }
                                >
                                  <EditablePreview />
                                  <EditableInput />
                                </Editable>
                              ) : (
                                <Text>{record.date}</Text>
                              )}
                            </Td>
                            <Td>
                              {isEditing ? (
                                <Editable
                                  defaultValue={record.duty_on_time}
                                  onSubmit={(value) =>
                                    handleChange(index, "duty_on_time", value)
                                  }
                                >
                                  <EditablePreview />
                                  <EditableInput />
                                </Editable>
                              ) : (
                                <Text>{record.duty_on_time}</Text>
                              )}
                            </Td>
                            <Td>
                              {isEditing ? (
                                <Editable
                                  defaultValue={record.duty_off_time}
                                  onSubmit={(value) =>
                                    handleChange(index, "duty_off_time", value)
                                  }
                                >
                                  <EditablePreview />
                                  <EditableInput />
                                </Editable>
                              ) : (
                                <Text>{record.duty_off_time}</Text>
                              )}
                            </Td>
                            {displayedData[index + 1] && (
                              <>
                                <Td>
                                  {isEditing ? (
                                    <Editable
                                      defaultValue={
                                        displayedData[index + 1].date
                                      }
                                      onSubmit={(value) =>
                                        handleChange(index + 1, "date", value)
                                      }
                                    >
                                      <EditablePreview />
                                      <EditableInput />
                                    </Editable>
                                  ) : (
                                    <Text>{displayedData[index + 1].date}</Text>
                                  )}
                                </Td>
                                <Td>
                                  {isEditing ? (
                                    <Editable
                                      defaultValue={
                                        displayedData[index + 1].duty_on_time
                                      }
                                      onSubmit={(value) =>
                                        handleChange(
                                          index + 1,
                                          "duty_on_time",
                                          value
                                        )
                                      }
                                    >
                                      <EditablePreview />
                                      <EditableInput />
                                    </Editable>
                                  ) : (
                                    <Text>
                                      {displayedData[index + 1].duty_on_time}
                                    </Text>
                                  )}
                                </Td>
                                <Td>
                                  {isEditing ? (
                                    <Editable
                                      defaultValue={
                                        displayedData[index + 1].duty_off_time
                                      }
                                      onSubmit={(value) =>
                                        handleChange(
                                          index + 1,
                                          "duty_off_time",
                                          value
                                        )
                                      }
                                    >
                                      <EditablePreview />
                                      <EditableInput />
                                    </Editable>
                                  ) : (
                                    <Text>
                                      {displayedData[index + 1].duty_off_time}
                                    </Text>
                                  )}
                                </Td>
                              </>
                            )}
                          </Tr>
                        );
                      }
                      return rows;
                    },
                    []
                  )}
                </Tbody>
              </Table>
              {filteredData.length > 10 && (
                <Button
                  colorScheme="blue"
                  mt={4}
                  onClick={() => setShowAllRows(!showAllRows)}
                >
                  {showAllRows ? "Show Less" : "Show All"}
                </Button>
              )}
            </Box>
          </div>
        </Box>
      </div>
      <Button mt={4} colorScheme="blue" onClick={saveData}>
        Save All Data
      </Button>
    </ChakraProvider>
  );
};

export default ExcelFilePage;
