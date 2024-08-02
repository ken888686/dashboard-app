"use client";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { axiosInstance } from "../lib/axios";

export default function Profile() {
  const { data: session } = useSession();

  const { isOpen, onOpen, onClose } = useDisclosure();
  const handleOpen = () => {
    onOpen();
  };

  const handleSendEmail = async () => {
    onClose();
    axiosInstance.defaults.headers.common.Authorization = `Bearer ${session?.customJwt}`;
    const response = await axiosInstance.put("auth/email/send-verification");
    console.log(response.data);
  };

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        <Card className="py-4">
          <CardHeader className="flex items-center justify-center px-4 pb-0 pt-2">
            <h4 className="text-large font-bold">{session?.user.name}</h4>
          </CardHeader>
          <CardBody className="flex flex-col gap-5 overflow-visible py-2">
            {session?.user.image ? (
              <Image
                alt="Card background"
                className="rounded-xl object-cover"
                src={`${session?.user.image?.split("=")[0]}=s200`}
                width={200}
              />
            ) : (
              <Image
                src={`https://dummyjson.com/image/200?fontFamily=Roboto&text=Hello!+${session?.user.name}!`}
                alt="Card background"
                width={200}
              />
            )}
            <Button
              className={
                session?.user.email_verified
                  ? "border-default-200 bg-transparent text-foreground"
                  : ""
              }
              color="primary"
              radius="full"
              size="sm"
              variant={session?.user.email_verified ? "bordered" : "solid"}
              isDisabled={session?.user.email_verified}
              onPress={() => handleOpen()}
            >
              {session?.user.email_verified ? "Activated" : "Activate"}
            </Button>
          </CardBody>
        </Card>
      </div>
      <Modal backdrop="blur" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Activate Your Account?</ModalHeader>
              <ModalBody>
                Do you want to send a email to
                <span className="contents font-bold">{session?.user.email}</span> to activate your
                account?
              </ModalBody>
              <ModalFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  Close
                </Button>
                <Button color="primary" onPress={handleSendEmail}>
                  Accept
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
