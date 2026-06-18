"use client";

import { useEffect } from "react";

export function ScrollState() {
  useEffect(() => {
    const root = document.documentElement;

    function updateScrollState() {
      root.classList.toggle("is-scrolled", window.scrollY > 24);
    }

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateScrollState);
      root.classList.remove("is-scrolled");
    };
  }, []);

  return null;
}
