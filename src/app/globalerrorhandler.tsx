"use client";

import { useGlobalErrorHandler } from "./hooks/useGlobalErrorHandler";
import { useGlobalPromiseRejectionHandler } from "./hooks/useGlobalPromiseRejectionHandler";

export default function GlobalErrorHandler() {

  useGlobalErrorHandler();
  useGlobalPromiseRejectionHandler();

  return ("")
}