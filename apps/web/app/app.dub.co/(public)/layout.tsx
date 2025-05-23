import { Header } from "@/ui/landing/components/header.tsx";
import { ReactNode } from "react";
import { Footer } from "ui/landing/components/footer";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col justify-between bg-neutral-50/80">
      <Header />
      {children}
      <Footer />
    </div>
  );
}
