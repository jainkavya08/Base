import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
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
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('personal-dashboard-storage');
                if (stored) {
                  const state = JSON.parse(stored).state;
                  if (state && state.settings) {
                    if (state.settings.theme === 'dark') {
                      document.documentElement.classList.add('dark');
                      document.documentElement.setAttribute('data-theme', 'dark');
                    }
                    if (state.settings.accentColor && state.settings.accentColor !== 'default') {
                      const accents = {
                        Gold: '#F4C94C',
                        Amber: '#f59e0b',
                        Blue: '#3b82f6',
                        Green: '#10b981',
                        Purple: '#8b5cf6',
                        Red: '#ef4444'
                      };
                      const color = accents[state.settings.accentColor];
                      if (color) {
                        document.documentElement.style.setProperty('--accent', color);
                        document.documentElement.style.setProperty('--primary', color);
                        document.documentElement.style.setProperty('--ring', color);
                        document.documentElement.style.setProperty('--sidebar-ring', color);
                        document.documentElement.style.setProperty('--sidebar-primary', color);
                      }
                    }
                  }
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-full flex bg-canvas text-ink">
        <GlobalHooks />
        <NavRail />
        <main className="flex-1 pb-20 md:pb-0 pl-0 md:pl-32 min-h-screen min-w-0">
          <AuthWrapper>
            {children}
          </AuthWrapper>
        </main>
      </body>
    </html>
  );
}
