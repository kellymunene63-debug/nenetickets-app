"use client";

import { useEffect } from "react";

export default function PWARegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[NeneTickets] Service worker registered:", reg.scope);
          })
          .catch((err) => {
            console.warn("[NeneTickets] Service worker registration failed:", err);
          });
      });
    }
  }, []);

  return null;
}
