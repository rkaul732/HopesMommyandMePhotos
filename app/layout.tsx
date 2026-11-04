import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mommy & Me Photos | HOPES",
  description: "Reserve a Mommy & Me photo session with the HOPES program at Bright Harbor Healthcare.",
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
