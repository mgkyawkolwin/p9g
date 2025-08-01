"use client";

import { useEffect } from "react";
import { toast } from "sonner";

export const useGlobalPromiseRejectionHandler = () => {
  useEffect(() => {
    const handleRejection = (event: PromiseRejectionEvent) => {
      console.error("Unhandled Promise Rejection:", event.reason);
      toast('Unhandled client error occured. '+event.reason);
    };

    window.addEventListener("unhandledrejection", handleRejection);
    return () => {
      window.removeEventListener("unhandledrejection", handleRejection);
    };
  }, []);
};