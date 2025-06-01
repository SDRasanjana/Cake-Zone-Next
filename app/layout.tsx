import Footer from "@/components/footer";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from 'react-hot-toast';

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
    <ClerkProvider
      appearance={{
        baseTheme: dark,
        variables: { colorPrimary: "#f97316", fontSize: "16px" },
      }}
    >      <html lang="en">        <body className="bg-gray-900 text-white">
          <CartProvider>
            <Navbar />
            {children}
            <Footer />
            <Toaster position="bottom-right" />
          </CartProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
