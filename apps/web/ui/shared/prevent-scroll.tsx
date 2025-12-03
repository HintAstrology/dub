"use client";

import { useEffect } from "react";

export function PreventScroll() {
  useEffect(() => {
    // Prevent scrolling on mount
    const html = document.documentElement;
    const body = document.body;
    
    const originalHtmlOverflow = html.style.overflow;
    const originalBodyOverflow = body.style.overflow;
    
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    
    // Restore scrolling on unmount
    return () => {
      html.style.overflow = originalHtmlOverflow;
      body.style.overflow = originalBodyOverflow;
    };
  }, []);

  return null;
}

