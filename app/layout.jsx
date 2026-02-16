import { Inter } from "next/font/google";
import "./globals.css";
import { Toasts } from "@/components/Toasts";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { SwRegistration } from "@/components/SwRegistration";
import { InstallPrompt } from "@/components/InstallPrompt";
import { QueryProvider } from "@/providers/QueryProvider";
import { siteConfig } from "@/config/site";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: siteConfig.siteTitle,
  description: siteConfig.siteDescription,
  icons: {
    icon: `/${siteConfig.favicon}`,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var k='${siteConfig.themeStorageKey}';var d='${siteConfig.defaultTheme}';var t=localStorage.getItem(k)||d;var el=document.documentElement;el.classList.remove('light','dark');el.classList.add(t);el.style.colorScheme=t;})();`,
          }}
        />
        <link rel="icon" href={`/${siteConfig.favicon}`} type="image/svg+xml" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <QueryProvider>
          {children}
          <Toasts />
          <OfflineIndicator />
          <SwRegistration />
          <InstallPrompt />
        </QueryProvider>
      </body>
    </html>
  );
}
