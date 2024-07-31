import { Divider } from "@nextui-org/react";
import EmailLoginForm from "../components/email-login-form";
import GoogleButton from "../components/google-button";

export default function LoginPage() {
  return (
    <div className="flex h-dvh flex-col items-center justify-center px-16">
      <EmailLoginForm />
      <Divider className="my-4" />
      <GoogleButton />
    </div>
  );
}
