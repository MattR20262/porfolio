import type { Metadata } from "next";
import { Cormorant_Garamond, Montserrat, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Matt Ashford — Luxury Photographer | New York",
    template: "%s | Matt Ashford Photography",
  },
  description:
    "Award-winning luxury photographer based in New York. Specializing in weddings, portraits, fashion, and editorial photography worldwide.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ),
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Matt Ashford Photography",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${montserrat.variable} ${inter.variable}`}
    >
      <body>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#f5f3ef",
              border: "1px solid rgba(201,168,76,0.2)",
              borderRadius: "2px",
              fontFamily: "var(--font-montserrat), Montserrat, sans-serif",
              fontSize: "0.75rem",
              letterSpacing: "0.05em",
            },
            success: {
              iconTheme: { primary: "#c9a84c", secondary: "#080808" },
            },
            error: {
              iconTheme: { primary: "#ef4444", secondary: "#080808" },
            },
          }}
        />
      </body>
    </html>
  );
}
