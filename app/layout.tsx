import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import AppShell from "@/components/AppShell";
import { DashboardTabProvider } from "@/contexts/DashboardTabContext";

export const metadata = {
  title: "CakeZone",
  description: "AI-powered cake shop system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-900 text-white">
        <ClerkProvider
          appearance={{
            baseTheme: dark,
            variables: { colorPrimary: "#f97316", fontSize: "16px" },
          }}
        >
          <DashboardTabProvider>
            <AppShell>{children}</AppShell>
          </DashboardTabProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
