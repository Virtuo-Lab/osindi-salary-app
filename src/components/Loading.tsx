import { Button, Center } from "@chakra-ui/react";
import { BeatLoader } from "react-spinners";

const Loading = () => {
  return (
    <Center height="100vh">
      <Button
        isLoading={true}
        colorScheme="blue"
        spinner={<BeatLoader size={16} color="white" />}
      >
        Click me
      </Button>
    </Center>
  );
};

export default Loading;
