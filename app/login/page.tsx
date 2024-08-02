"use client";
import { Divider } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import EmailLoginForm from "../components/email-login-form";
import GoogleButton from "../components/google-button";

export default function LoginPage() {
  const router = useRouter();
  const { data: session } = useSession();

  if (session) {
    router.push("/");
  }

  return (
    <div className="flex h-dvh flex-col items-center justify-center px-16">
      <EmailLoginForm />
      <Divider className="my-4" />
      <GoogleButton />
    </div>
  );
}
