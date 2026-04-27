// app/layout.js
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Sewa Manager",
  description: "Manage sewa sheets and volunteer records",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-stone-50 text-stone-800">
        <div className="app-navbar">
          <Navbar />
        </div>
        <main className="app-main max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
