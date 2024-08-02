"use client";
import { Button, Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@nextui-org/react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export default function NavbarElement() {
  const { data: session } = useSession();

  return (
    <Navbar shouldHideOnScroll>
      <NavbarBrand>
        <Link href="/" className="font-bold">
          Hi! {session?.user.name ?? "Friend"}!
        </Link>
      </NavbarBrand>
      <NavbarContent justify="end">
        {session ? (
          <>
            <NavbarItem className="hidden lg:flex">
              <Link href="/profile">Profile</Link>
            </NavbarItem>
            <NavbarItem className="hidden lg:flex">
              <Button onClick={() => signOut()}>Logout</Button>
            </NavbarItem>
          </>
        ) : (
          <NavbarItem className="hidden lg:flex">
            <Link href="/login">Login</Link>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
}
