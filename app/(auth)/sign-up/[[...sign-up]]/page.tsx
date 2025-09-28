// app/register/page.tsx
"use client";
import { SignUp, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
  // Removed complex useEffect logic - let Clerk handle the redirect
  // User registration will be handled by the webhook when configured

  return (
    <main className="flex justify-center items-center h-screen">
      <SignUp />
    </main>
  );
};
export default SignUpPage;
