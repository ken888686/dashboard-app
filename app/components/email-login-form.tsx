"use client";
import { Button, Input } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EmailLoginForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.ok) {
        console.log(result);
      } else if (result?.error) {
        const error: {
          status: number;
          message: string;
          name: string;
        } = JSON.parse(result.error as string);
        setError(error.message);
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while logging in.");
    }
  };

  return (
    <form className="flex w-full flex-col gap-2" onSubmit={handleSubmit}>
      <Input isRequired type="email" name="email" label="Email" />
      <Input isRequired type="password" name="password" label="Password" />
      <Button className="" type="submit">
        Login
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
