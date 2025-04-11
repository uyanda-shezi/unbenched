import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./providers";
import Header from "@/components/header/Header"; // Import the Header component

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Unbenched",
    description: "Find or create games to play in",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <AuthProvider>
                    <Header /> {/* Place the Header here, inside AuthProvider */}
                    <main className="container mx-auto p-4"> {/* Optional: Wrap children in a main element */}
                        {children}
                    </main>
                </AuthProvider>
            </body>
        </html>
    );
}