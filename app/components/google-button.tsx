"use client";
import { Button } from "@nextui-org/react";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useState } from "react";

export default function GoogleButton() {
  const { data: session, status } = useSession();
  const [hover, setHover] = useState(false);

  switch (status) {
    case "loading":
      return (
        <Button className="w-full" isLoading>
          Loading...
        </Button>
      );
    case "unauthenticated":
      return (
        <Button onClick={() => signIn("google")} className="w-full" startContent={<GoogleIcon />}>
          Login with Google
        </Button>
      );
    case "authenticated":
      return (
        <Button
          onClick={() => signOut()}
          onMouseOver={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="w-full bg-success-500 text-black hover:bg-danger-500"
        >
          {hover ? "Log out" : `Hi! ${session?.user?.name}`}
        </Button>
      );
  }
}

function GoogleIcon() {
  return (
    <Image
      alt="Google icon"
      loading="lazy"
      height="24"
      width="24"
      id="provider-logo-dark"
      src="https://authjs.dev/img/providers/google.svg"
    />
  );
}
