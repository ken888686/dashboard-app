"use client";
import { Spinner } from "@nextui-org/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function Home() {
  const { status } = useSession();

  const content = () => {
    switch (status) {
      case "unauthenticated":
        redirect("/login");
      case "loading":
        return <Spinner size="lg" label="Loading..." aria-label="Loading..." color="primary" />;
      case "authenticated":
        return (
          <div>
            <div>Dashboard App</div>
          </div>
        );
    }
  };

  return <main className="flex flex-col items-center">{content()}</main>;
}
