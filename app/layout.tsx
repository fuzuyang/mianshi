import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "知识资产问答工作台",
  description: "Knowledge Asset QA Console built with Next.js, React, TypeScript, and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
