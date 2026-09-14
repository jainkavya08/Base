import type { Metadata } from "next";
import { NavRail } from "@/components/ui/nav-rail";
import { GlobalHooks } from "@/components/global-hooks";
import { AuthWrapper } from "@/components/auth/auth-wrapper";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Personal Dashboard",
  description: "Your local-first productivity hub",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex bg-canvas text-ink">
        <AuthWrapper>
          <GlobalHooks />
          <NavRail />
          <main className="flex-1 pl-28 md:pl-32 min-h-screen">
            {children}
          </main>
        </AuthWrapper>
      </body>
    </html>
  );
}
