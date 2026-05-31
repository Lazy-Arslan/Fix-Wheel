import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FixWheel — Digital Vehicle Service Platform",
    template: "%s | FixWheel",
  },
  description:
    "Book trusted mechanics near you. Car, bike, and vehicle repair services with transparent pricing.",
  icons: {
    icon: [{ url: "/images/fix-wheel.png", type: "image/png" }],
    apple: [{ url: "/images/fix-wheel.png", type: "image/png" }],
    shortcut: "/images/fix-wheel.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full overflow-x-hidden ${jakarta.variable}`}>
      <body className="h-full min-h-full overflow-x-hidden antialiased">{children}</body>
    </html>
  );
}
