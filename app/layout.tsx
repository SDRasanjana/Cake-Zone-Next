// app/layout.tsx

import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import Navbar from "@/components/Navbar";
import Footer from "@/components/footer";
import { CartProvider } from "@/contexts/CartContext";
import { Toaster } from "react-hot-toast";

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
          <CartProvider>
            <Navbar />
            {children}
            <Footer />
            <Toaster position="bottom-right" />
          </CartProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
export const config = {
  runtime: "edge",
};