import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HOPES Events | Bright Harbor Healthcare",
  description: "Register for HOPES events with Bright Harbor Healthcare.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
