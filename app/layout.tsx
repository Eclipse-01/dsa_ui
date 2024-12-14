import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeInitializer } from "@/components/theme-initializer";
import { FontInitializer } from "@/components/font-initializer";

const miSans = localFont({
  src: [
    {
      path: './fonts/MiSans-Light.woff',  // 使用更细的字重
      weight: '300',  // 调整为 Light 字重
      style: 'normal',
    }
  ],
  variable: '--font-misans',
});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "生命体征监测系统",
  description: "实时监测和展示生命体征数据",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${miSans.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ThemeInitializer />
          <FontInitializer />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
