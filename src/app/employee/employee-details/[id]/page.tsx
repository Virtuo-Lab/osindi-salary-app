"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import {
  Box,
  Heading,
  Text,
  Flex,
  VStack,
  HStack,
  Divider,
  Spinner,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Checkbox,
  Table,
  TableCaption,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import Loading from "@/components/Loading";
import SaveSuccess from "@/components/SaveSuccess";
import Swal from "sweetalert2";

const EmployeeDetails: React.FC = () => {
  const [employeeName, setEmployeeName] = useState<string>("");
  const [employeeId, setEmployeeId] = useState<number>(0);
  const [address, setAddress] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [NIC, setNIC] = useState<string>("");
  const [basicSalary, setBasicSalary] = useState<number>(0);
  const [attendanceAllowance, setAttendanceAllowance] = useState<number>(0);
  const [dutyOnTime, setDutyOnTime] = useState<string>("");
  const [dutyOffTime, setDutyOffTime] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [deductionTitle, setDeductionTitle] = useState<string>("");
  const [deductionAmount, setDeductionAmount] = useState<number>(0);
  const [deductionIsActive, setDeductionIsActive] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [allowanceTitle, setAllowanceTitle] = useState<string>("");
  const [allowanceAmount, setAllowanceAmount] = useState<number>(0);
  const [allowanceIsActive, setAllowanceIsActive] = useState<boolean>(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [isAllowanceModalOpen, setIsAllowanceModalOpen] =
    useState<boolean>(false);
  const [isDeductionModalOpen, setIsDeductionModalOpen] =
    useState<boolean>(false);
  const [allowances, setAllowances] = useState<any[]>([]);
  const [deductions, setDeductions] = useState<any[]>([]);
  const [isAllowanceEditModalOpen, setIsAllowanceEditModalOpen] =
    useState<boolean>(false);
  const [isDeductionEditModalOpen, setIsDeductionEditModalOpen] =
    useState<boolean>(false);
  const [deductionTitleEdit, setDeductionTitleEdit] = useState<string>("");
  const [deductionAmountEdit, setDeductionAmountEdit] = useState<number>(0);
  const [deductionIsActiveEdit, setDeductionIsActiveEdit] =
    useState<boolean>(true);
  const [allowanceTitleEdit, setAllowanceTitleEdit] = useState<string>("");
  const [allowanceAmountEdit, setAllowanceAmountEdit] = useState<number>(0);
  const [allowanceIsActiveEdit, setAllowanceIsActiveEdit] =
    useState<boolean>(true);
  const [deductionIdEdit, setDeductionIdEdit] = useState<number>(0);
  const [allowanceIdEdit, setAllowanceIdEdit] = useState<number>(0);
  const [modelLoading, setModelLoading] = useState<boolean>(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const url = window.location.href;
        const id = url.split("/").pop();

        const employeeResponse = await fetch(
          `/api/employee/get-employee/${id}`
        );
        const employeeData = await employeeResponse.json();

        const allowancesResponse = await fetch(
          `/api/employee/allowance/get-allowances/${id}`
        );
        const allowancesData = await allowancesResponse.json();

        const deductionsResponse = await fetch(
          `/api/employee/deduction/get-deduction/${id}`
        );
        const deductionsData = await deductionsResponse.json();

        // Update state with the fetched data
        setEmployeeId(employeeData.employeeId);
        setEmployeeName(employeeData.name);
        setAddress(employeeData.address);
        setContact(employeeData.contact);
        setEmail(employeeData.email);
        setNIC(employeeData.NIC);
        setBasicSalary(employeeData.basicSalary);
        setAttendanceAllowance(employeeData.attendanceAllowance);
        setDutyOnTime(employeeData.dutyOnTime);
        setDutyOffTime(employeeData.dutyOffTime);
        setRemarks(employeeData.remarks);
        setAllowances(allowancesData);
        setDeductions(deductionsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Set loading to false after all data has been fetched
      }
    };

    fetchData();
  }, [refresh]);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleSaveClick = async () => {
    setModelLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`/api/employee/update-employee`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId,
        name: employeeName,
        address,
        contact,
        email,
        NIC,
        basicSalary,
        dutyOnTime,
        dutyOffTime,
        remarks,
      }),
    });

    if (response.ok) {
      setIsEditModalOpen(false);
      setIsAllowanceModalOpen(false);
      setIsDeductionModalOpen(false);
      setIsAllowanceEditModalOpen(false);
      setIsDeductionEditModalOpen(false);
      setModelLoading(false);

      // Trigger the SaveSuccess component
      setShowSaveSuccess(true);

      // Optionally hide the alert component after some time to reset the state
      setTimeout(() => setShowSaveSuccess(false), 1500);
    } else {
      console.error("Failed to update employee");
      setModelLoading(false);
    }
  };

  const handleAllowanceClick = () => {
    setIsAllowanceModalOpen(true);
  };

  const handleDeductionClick = () => {
    setIsDeductionModalOpen(true);
  };

  const handleAllowanceSaveClick = async () => {
    setModelLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const id = employeeId;
    const response = await fetch(`/api/employee/allowance/add-allowance`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId: id,
        allowanceTitle: allowanceTitle,
        amount: allowanceAmount,
        activeStatus: allowanceIsActive,
      }),
    });

    if (response.ok) {
      setIsAllowanceModalOpen(false);
      setModelLoading(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 1500);
      setRefresh(!refresh);
    } else {
      console.error("Failed to add allowance");
      setModelLoading(false);
    }
  };

  const handleDeductionSaveClick = async () => {
    setModelLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const id = employeeId;
    const response = await fetch(`/api/employee/deduction/add-deduction`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        employeeId: id,
        deductionTitle: deductionTitle,
        amount: deductionAmount,
        activeStatus: deductionIsActive,
      }),
    });

    if (response.ok) {
      setIsDeductionModalOpen(false);
      setModelLoading(false);

      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 1500);
      setRefresh(!refresh);
    } else {
      console.error("Failed to add deduction");
      setModelLoading(false);
    }
  };

  const handleEditAllowance = async (id: number) => {
    setModelLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`/api/employee/allowance/edit-allowance`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        allowanceId: id,
        allowanceTitle: allowanceTitleEdit,
        amount: allowanceAmountEdit,
        activeStatus: allowanceIsActiveEdit,
      }),
    });

    if (response.ok) {
      setIsAllowanceEditModalOpen(false);
      setModelLoading(false);

      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 1500);
      setRefresh(!refresh);
    } else {
      console.error("Failed to edit allowance");
      setModelLoading(false);
    }
  };

  const handleDeleteAllowance = async (id: number) => {
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
        `/api/employee/allowance/delete-allowance/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const newAllowances = allowances.filter(
          (allowance) => allowance.id !== id
        );
        setAllowances(newAllowances);
        setRefresh(!refresh);
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
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

  const handleEditDeduction = async (id: number) => {
    setModelLoading(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const response = await fetch(`/api/employee/deduction/edit-deduction`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        deductionId: id,
        deductionTitle: deductionTitleEdit,
        amount: deductionAmountEdit,
        activeStatus: deductionIsActiveEdit,
      }),
    });

    if (response.ok) {
      setIsDeductionEditModalOpen(false);
      setModelLoading(false);

      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 1500);
      setRefresh(!refresh);
    } else {
      console.error("Failed to edit deduction");
      setModelLoading(false);
    }
  };

  const handleDeleteDeduction = async (id: number) => {
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
        `/api/employee/deduction/delete-deduction/${id}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const newDeductions = deductions.filter(
          (deduction) => deduction.id !== id
        );
        setDeductions(newDeductions);
        setRefresh(!refresh);
        Swal.fire({
          title: "Deleted!",
          text: "Your file has been deleted.",
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

  const boxBgColor = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900");

  return (
    <div>
      <div>
        <Header />
        {isLoading ? (
          <Loading />
        ) : (
          <Grid templateColumns="repeat(2, 1fr)" gap={24} p={6}>
            <GridItem colSpan={1} ml={32}>
              <Box
                p="6"
                bg={boxBgColor}
                borderRadius="md"
                boxShadow="md"
                maxW="800px"
                mt="8"
              >
                <Heading as="h1" size="xl" textAlign="center" mb="6">
                  Employee Details
                </Heading>

                <VStack spacing="4" align="start">
                  <HStack>
                    <Text fontWeight="bold" color={textColor}>
                      Employee ID:
                    </Text>
                    <Text color={textColor}>{employeeId}</Text>
                  </HStack>
                  <Divider />
                  <HStack>
                    <Text fontWeight="bold" color={textColor}>
                      Name:
                    </Text>
                    <Text color={textColor}>{employeeName}</Text>
                  </HStack>
                  <Divider />
                  <HStack>
                    <Text fontWeight="bold" color={textColor}>
                      Address:
                    </Text>
                    <Text color={textColor}>{address}</Text>
                  </HStack>
                  <Divider />
                  <HStack>
                    <Text fontWeight="bold" color={textColor}>
                      Contact:
                    </Text>
                    <Text color={textColor}>{contact}</Text>
                  </HStack>
                  <Divider />
                  <HStack>
                    <Text fontWeight="bold" color={textColor}>
                      Email:
                    </Text>
                    <Text color={textColor}>{email}</Text>
                  </HStack>
                  <Divider />
                  <HStack>
                    <Text fontWeight="bold" color={textColor}>
                      NIC:
                    </Text>
                    <Text color={textColor}>{NIC}</Text>
                  </HStack>
                  <Divider />
                  <HStack>
                    <Text fontWeight="bold" color={textColor}>
                      Basic Salary:
                    </Text>
                    <Text color={textColor}>{basicSalary}</Text>
                  </HStack>
                  <Divider />

                  <HStack>
                    <Text fontWeight="bold" color={textColor}>
                      Attendance Allowance:
                    </Text>
                    <Text color={textColor}>{attendanceAllowance}</Text>
                  </HStack>
                  <Divider />
                  <HStack>
                    <Text fontWeight="bold" color={textColor}>
                      Duty On Time:
                    </Text>
                    <Text color={textColor}>{dutyOnTime}</Text>
                  </HStack>
                  <Divider />
                  <HStack>
                    <Text fontWeight="bold" color={textColor}>
                      Duty Off Time:
                    </Text>
                    <Text color={textColor}>{dutyOffTime}</Text>
                  </HStack>
                  <Divider />
                  <HStack>
                    <Text fontWeight="bold" color={textColor}>
                      Remarks:
                    </Text>
                    <Text color={textColor}>{remarks}</Text>
                  </HStack>
                  <Divider />

                  <HStack spacing="4">
                    <Button colorScheme="blue" onClick={handleEditClick}>
                      Edit
                    </Button>
                    <Button colorScheme="green" onClick={handleAllowanceClick}>
                      Add Allowance
                    </Button>
                    <Button colorScheme="red" onClick={handleDeductionClick}>
                      Add Deduction
                    </Button>
                  </HStack>
                </VStack>
              </Box>
            </GridItem>
            <GridItem colSpan={1} mr={32}>
              <Box mt={8} borderWidth={1}>
                <Table variant="simple">
                  <TableCaption>Allowances</TableCaption>
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
                      <Th>Amount</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {allowances.map((allowance) => (
                      <Tr key={allowance.allowanceId}>
                        <Td>{allowance.allowanceTitle}</Td>
                        <Td>{allowance.amount}</Td>
                        <Td>
                          <Button
                            colorScheme="blue"
                            size="sm"
                            onClick={() => {
                              setIsAllowanceEditModalOpen(true);
                              setAllowanceAmountEdit(allowance.amount);
                              setAllowanceTitleEdit(allowance.allowanceTitle);
                              setAllowanceIsActiveEdit(allowance.active);
                              setAllowanceIdEdit(allowance.allowanceId);
                            }}
                            style={{ marginRight: "5px" }}
                          >
                            Edit
                          </Button>
                          <Button
                            colorScheme="red"
                            size="sm"
                            onClick={() =>
                              handleDeleteAllowance(allowance.allowanceId)
                            }
                          >
                            Delete
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <Box mt={16} borderWidth={1}>
                <Table variant="simple">
                  <TableCaption>Deductions</TableCaption>
                  <Thead>
                    <Tr>
                      <Th>Title</Th>
                      <Th>Amount</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {deductions.map((deduction) => (
                      <Tr key={deduction.deductionId}>
                        <Td>{deduction.deductionTitle}</Td>
                        <Td>{deduction.amount}</Td>
                        <Td>
                          <Button
                            colorScheme="blue"
                            size="sm"
                            onClick={() => {
                              setIsDeductionEditModalOpen(true);
                              setDeductionAmountEdit(deduction.amount);
                              setDeductionTitleEdit(deduction.deductionTitle);
                              setDeductionIsActiveEdit(deduction.active);
                              setDeductionIdEdit(deduction.deductionId);
                            }}
                            style={{ marginRight: "5px" }}
                          >
                            Edit
                          </Button>
                          <Button
                            colorScheme="red"
                            size="sm"
                            onClick={() =>
                              handleDeleteDeduction(deduction.deductionId)
                            }
                          >
                            Delete
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            </GridItem>
          </Grid>
        )}
        {showSaveSuccess && <SaveSuccess />}
      </div>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Employee Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing="4">
              <FormControl>
                <FormLabel>Name</FormLabel>
                <Input
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Address</FormLabel>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Contact</FormLabel>
                <Input
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>NIC</FormLabel>
                <Input value={NIC} onChange={(e) => setNIC(e.target.value)} />
              </FormControl>
              <FormControl>
                <FormLabel>Basic Salary</FormLabel>
                <Input
                  type="number"
                  value={basicSalary}
                  onChange={(e) => setBasicSalary(Number(e.target.value))}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Duty On Time</FormLabel>
                <Input
                  value={dutyOnTime}
                  onChange={(e) => setDutyOnTime(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Duty Off Time</FormLabel>
                <Input
                  value={dutyOffTime}
                  onChange={(e) => setDutyOffTime(e.target.value)}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Remarks</FormLabel>
                <Input
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleSaveClick}>
              Save
            </Button>
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
          </ModalFooter>

          {modelLoading && (
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              bg="rgba(0, 0, 0, 0.5)"
              display="flex"
              justifyContent="center"
              alignItems="center"
              zIndex="overlay"
              //backdropFilter="blur(5px)"
            >
              <Spinner size="xl" color="white" />
            </Box>
          )}
        </ModalContent>
      </Modal>

      {/* Add Allowance Modal */}
      <Modal
        isOpen={isAllowanceModalOpen}
        onClose={() => setIsAllowanceModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Allowance</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Allowance Title</FormLabel>
              <Input
                type="text"
                value={allowanceTitle}
                onChange={(e) => setAllowanceTitle(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Allowance Amount</FormLabel>
              <Input
                type="number"
                value={allowanceAmount}
                onChange={(e) => setAllowanceAmount(Number(e.target.value))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Active Status</FormLabel>
              <Checkbox
                isChecked={allowanceIsActive}
                onChange={(e) => setAllowanceIsActive(e.target.checked)}
              >
                Active
              </Checkbox>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="green"
              mr={3}
              onClick={handleAllowanceSaveClick}
            >
              Save
            </Button>
            <Button onClick={() => setIsAllowanceModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
          {modelLoading && (
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              bg="rgba(0, 0, 0, 0.5)"
              display="flex"
              justifyContent="center"
              alignItems="center"
              zIndex="overlay"
              //backdropFilter="blur(5px)"
            >
              <Spinner size="xl" color="white" />
            </Box>
          )}
        </ModalContent>
      </Modal>

      {/* Add Deduction Modal */}
      <Modal
        isOpen={isDeductionModalOpen}
        onClose={() => setIsDeductionModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Deduction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Deduction Title</FormLabel>
              <Input
                type="text"
                value={deductionTitle}
                onChange={(e) => setDeductionTitle(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Deduction Amount</FormLabel>
              <Input
                type="number"
                value={deductionAmount}
                onChange={(e) => setDeductionAmount(Number(e.target.value))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Active Status</FormLabel>
              <Checkbox
                isChecked={deductionIsActive}
                onChange={(e) => setDeductionIsActive(e.target.checked)}
              >
                Active
              </Checkbox>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={handleDeductionSaveClick}>
              Save
            </Button>
            <Button onClick={() => setIsDeductionModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
          {modelLoading && (
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              bg="rgba(0, 0, 0, 0.5)"
              display="flex"
              justifyContent="center"
              alignItems="center"
              zIndex="overlay"
              //backdropFilter="blur(5px)"
            >
              <Spinner size="xl" color="white" />
            </Box>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Allowance Modal */}
      <Modal
        isOpen={isAllowanceEditModalOpen}
        onClose={() => setIsAllowanceEditModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Allowance</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Allowance Title</FormLabel>
              <Input
                type="text"
                value={allowanceTitleEdit}
                onChange={(e) => setAllowanceTitleEdit(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Allowance Amount</FormLabel>
              <Input
                type="number"
                value={allowanceAmountEdit}
                onChange={(e) => setAllowanceAmountEdit(Number(e.target.value))}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Active Status</FormLabel>
              <Checkbox
                isChecked={allowanceIsActiveEdit}
                onChange={(e) => setAllowanceIsActiveEdit(e.target.checked)}
              >
                Active
              </Checkbox>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleEditAllowance(allowanceIdEdit)}
            >
              Save
            </Button>
            <Button onClick={() => setIsAllowanceEditModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
          {modelLoading && (
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              bg="rgba(0, 0, 0, 0.5)"
              display="flex"
              justifyContent="center"
              alignItems="center"
              zIndex="overlay"
              //backdropFilter="blur(5px)"
            >
              <Spinner size="xl" color="white" />
            </Box>
          )}
        </ModalContent>
      </Modal>

      {/* Edit Deduction Modal */}
      <Modal
        isOpen={isDeductionEditModalOpen}
        onClose={() => setIsDeductionEditModalOpen(false)}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Deduction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Deduction Title</FormLabel>
              <Input
                type="text"
                value={deductionTitleEdit}
                onChange={(e) => setDeductionTitleEdit(e.target.value)}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Deduction Amount</FormLabel>
              <Input
                type="number"
                onChange={(e) => setDeductionAmountEdit(Number(e.target.value))}
                value={deductionAmountEdit}
              />
            </FormControl>
            <FormControl>
              <FormLabel>Active Status</FormLabel>
              <Checkbox
                isChecked={deductionIsActiveEdit}
                onChange={(e) => setDeductionIsActiveEdit(e.target.checked)}
              >
                Active
              </Checkbox>
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => handleEditDeduction(deductionIdEdit)}
            >
              Save
            </Button>
            <Button onClick={() => setIsDeductionEditModalOpen(false)}>
              Cancel
            </Button>
          </ModalFooter>
          {modelLoading && (
            <Box
              position="absolute"
              top="0"
              left="0"
              width="100%"
              height="100%"
              bg="rgba(0, 0, 0, 0.5)"
              display="flex"
              justifyContent="center"
              alignItems="center"
              zIndex="overlay"
              //backdropFilter="blur(5px)"
            >
              <Spinner size="xl" color="white" />
            </Box>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
};

export default EmployeeDetails;
