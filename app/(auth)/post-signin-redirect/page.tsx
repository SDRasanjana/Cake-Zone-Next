import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function PostSignInRedirect() {
  const user = await currentUser();
  // If not signed in, redirect to sign-in
  if (!user) {
    redirect("/sign-in");
  }
  // Get role from Clerk publicMetadata
  const role = user.publicMetadata?.role;
  if (role === "admin") {
    redirect("/dashboards/admin");
  } else if (role === "owner") {
    redirect("/dashboards/Owner");
  } else {
    redirect("/dashboards/customer");
  }
  // Fallback (should never reach here)
  return null;
}
