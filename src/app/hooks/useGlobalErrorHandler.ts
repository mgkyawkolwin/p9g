"use client";

import c from "@/lib/core/logger/ConsoleLogger";
import { useEffect } from "react";
import { toast } from "sonner";

export const useGlobalErrorHandler = () => {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      c.d(event.error);
      toast('Unhandled client error occured. Error:' + (event.error instanceof Error) ? event.error.message : '');
    };

    window.addEventListener("error", handleError);
    return () => window.removeEventListener("error", handleError);
  }, []);
};
