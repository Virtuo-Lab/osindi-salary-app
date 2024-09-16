"use client";

import { Button, Flex, Box, Spacer, Link } from "@chakra-ui/react";
import React from "react";

const Header: React.FC = () => {
  return (
    <Box
      as="header"
      bg="gray.800"
      color="white"
      px={6}
      py={4}
      boxShadow="sm"
      width="100vw" // Ensure the header spans the full viewport width
      boxSizing="border-box" // Include padding in the element's total width and height
    >
      <Flex alignItems="center">
        <Flex as="nav" gap={4}>
          <Button as={Link} href="/" colorScheme="teal" variant="solid">
            Home
          </Button>
          <Button as={Link} href="/employee" colorScheme="teal" variant="solid">
            Employee
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Header;
