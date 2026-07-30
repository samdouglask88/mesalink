import type { Metadata, Viewport } from "next";
import { Anton, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Display condensada e robusta p/ títulos grandes (pegada urbana, sem ser
// infantil). Corpo em Plus Jakarta Sans — moderna e legível, vibe startup.
const display = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://urbanburger.local"),
  title: {
    default: "Urban Burger — Os burgers mais insanos da cidade",
    template: "%s · Urban Burger",
  },
  description:
    "Pão artesanal, ingredientes selecionados e muito sabor. Smash burgers premium com alma de rua. Peça agora.",
  keywords: [
    "hamburgueria",
    "smash burger",
    "burger artesanal",
    "delivery",
    "Urban Burger",
  ],
  openGraph: {
    title: "Urban Burger — Os burgers mais insanos da cidade",
    description:
      "Pão artesanal, ingredientes selecionados e muito sabor. Smash burgers premium com alma de rua.",
    type: "website",
    locale: "pt_BR",
    siteName: "Urban Burger",
  },
  twitter: {
    card: "summary_large_image",
    title: "Urban Burger",
    description: "Os burgers mais insanos da cidade.",
  },
};

export const viewport: Viewport = {
  themeColor: "#1C1C1C",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
