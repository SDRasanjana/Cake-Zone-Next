import Footer from "@/components/footer";
import "./globals.css";
import Navbar from "@/components/Navbar";

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
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
