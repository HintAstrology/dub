"use client";

import { usePathname } from "next/navigation";

export function ConditionalFooter() {
  const pathname = usePathname();
  const isConstructorPage = pathname === "/constructor";

  if (isConstructorPage) {
    return null;
  }

  return (
    <footer className="bg-card shadow rounded-[20px] p-3 py-5">
      <div className="text-muted-foreground flex items-center justify-center text-sm">
        © 2024 GetQR. All rights reserved.
      </div>
    </footer>
  );
}



