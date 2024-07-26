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
        <Button className="w-60" isLoading>
          Loading...
        </Button>
      );
    case "unauthenticated":
      return (
        <Button
          onClick={() => signIn("google")}
          className="w-60"
          startContent={<GoogleIcon />}
        >
          Sign in with Google
        </Button>
      );
    case "authenticated":
      return (
        <Button
          onClick={() => signOut()}
          onMouseOver={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="w-60 bg-success-500 text-black hover:bg-danger-500"
        >
          {hover ? "Sign out" : `Hi! ${session?.user?.name}`}
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
