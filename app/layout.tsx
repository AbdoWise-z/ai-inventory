import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {ThemeProvider} from "@/components/providers/theme-provider";
import {ClerkProvider} from "@clerk/nextjs";
import {cn} from "@/lib/utils";
import GoogleAnalytics from "@/components/GoogleAnalytics";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Inventory",
  description: "Your awesome inventory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <GoogleAnalytics />
      <html lang="en" suppressHydrationWarning>
        <body className={cn(
          inter.className,
          "w-[100vw] h-[100vh]",
        )}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
