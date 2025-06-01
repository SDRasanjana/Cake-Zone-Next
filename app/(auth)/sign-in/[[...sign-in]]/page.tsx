// app/login/page.tsx
import { SignIn } from "@clerk/nextjs";

const SignInPage = () => {
  return (
    <main className="flex justify-center items-center h-screen">
      <SignIn />
    </main>
  );
};
export default SignInPage;
