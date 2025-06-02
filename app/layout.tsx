import Footer from "@/components/footer";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
<<<<<<< HEAD
import { CartProvider } from "../contexts/CartContext"; // Adjusted path
=======
import { CartProvider } from "@/context/CartContext";
import { Toaster } from 'react-hot-toast';
>>>>>>> ac31e0919c998c74b07f27d407478064513f979e

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
<<<<<<< HEAD
    >
      <CartProvider>
        <html lang="en">
          <body className="bg-gray-900 text-white flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </body>
        </html>
      </CartProvider>
=======
    >      <html lang="en">        <body className="bg-gray-900 text-white">
          <CartProvider>
            <Navbar />
            {children}
            <Footer />
            <Toaster position="bottom-right" />
          </CartProvider>
        </body>
      </html>
>>>>>>> ac31e0919c998c74b07f27d407478064513f979e
    </ClerkProvider>
  );
}
