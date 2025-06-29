// app/register/page.tsx
"use client";
import { SignUp, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

const SignUpPage = () => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();

  useEffect(() => {
    // When user is signed in after Clerk sign up (including social sign-in)
    if (
      isSignedIn &&
      user &&
      user.emailAddresses &&
      user.emailAddresses.length > 0
    ) {
      // Use a unique identifier to avoid duplicate registration
      const email = user.emailAddresses[0].emailAddress;
      // Use sessionStorage to prevent duplicate API calls per session
      if (!window.sessionStorage.getItem(`mongo-registered-${email}`)) {
        fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            password: "clerk-oauth", // placeholder, since Clerk manages password
          }),
        }).then(() => {
          window.sessionStorage.setItem(`mongo-registered-${email}`, "true");
        });
      }
    }
  }, [isSignedIn, user]);

  return (
    <main className="flex justify-center items-center h-screen">
      <SignUp afterSignUpUrl="/sign-up" />
    </main>
  );
};
export default SignUpPage;
