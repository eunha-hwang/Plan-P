import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Hydrator } from "@/components/Hydrator";
import { AppChrome } from "@/components/AppChrome";
import { DeviceFrame } from "@/components/DeviceFrame";
import { MixpanelProvider } from "@/components/MixpanelProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plan P · 일찍 도착하는 습관",
  description:
    "입력만 하면 AI가 출발시각을 알아서 정해주는 지각 방지 앱. 지도 예상시간을 믿지 않고, 넉넉히 일찍 도착합니다.",
};

export const viewport: Viewport = {
  themeColor: "#3182f6",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full">
        {/* Mobile: full-screen app · Desktop: inside an iPhone mockup frame */}
        <Hydrator />
        <MixpanelProvider />
        <DeviceFrame chrome={<AppChrome />}>{children}</DeviceFrame>
      </body>
    </html>
  );
}
