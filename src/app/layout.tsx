import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Feed - Your Personalized News",
  description: "Chat with AI to curate your personalized news feed",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-newspaper-bg antialiased">
        {children}
      </body>
    </html>
  );
}
