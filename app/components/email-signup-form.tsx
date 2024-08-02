"use client";
import { Button, Input } from "@nextui-org/react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function EmailSignUpForm() {
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const verifyPassword = (password: string): boolean => {
    // Regular expressions for each condition
    const lowerCaseRegex = /[a-z]/;
    const upperCaseRegex = /[A-Z]/;
    const digitRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

    // Check all conditions
    const hasLowerCase = lowerCaseRegex.test(password);
    const hasUpperCase = upperCaseRegex.test(password);
    const hasDigit = digitRegex.test(password);
    const hasSpecialChar = specialCharRegex.test(password);
    const hasMinLength = password.length >= 8;

    return hasLowerCase && hasUpperCase && hasDigit && hasSpecialChar && hasMinLength;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;
    const name = formData.get("name") as string;

    if (!name) {
      setError("Name is required.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!verifyPassword(password)) {
      const msg =
        "Password is too weak. It must contain at least one lowercase letter, one uppercase letter, one digit, one special character, and be at least 8 characters long.";
      setError(msg);
      return;
    }

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
        name,
        isNewUser: true,
      });
      if (result?.ok) {
        router.push("/");
      } else if (result?.error) {
        const error: {
          status: string;
          message: string;
          name: string;
        } = JSON.parse(result.error as string);
        console.log(error);
        setError(error.message);
      }
    } catch (error) {
      console.error(error);
      setError("An error occurred while logging in.");
    }
  };

  return (
    <form className="flex w-full flex-col gap-2" onSubmit={handleSubmit}>
      <Input isRequired type="text" name="name" label="Name" />
      <Input isRequired type="email" name="email" label="Email" value={email} />
      <Input isRequired type="password" name="password" label="Password" />
      <Input isRequired type="password" name="confirmPassword" label="Confirm Password" />
      <Button className="" type="submit">
        Sign Up
      </Button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
}
