import { GeistMono } from "geist/font/mono";
import { Inter, Anton, Caveat } from "next/font/google";
import localFont from "next/font/local";

export const satoshi = localFont({
  src: "../styles/Satoshi-Variable.woff2",
  variable: "--font-satoshi",
  weight: "300 900",
  display: "swap",
  style: "normal",
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const anton = Anton({
  variable: '--font-anton',
  weight: '400',
})

export const caveat = Caveat({
  variable: '--font-caveat',
  weight: '400'
})

export const geistMono = GeistMono;
