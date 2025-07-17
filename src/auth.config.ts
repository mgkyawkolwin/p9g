// auth.config.ts
import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  trustHost: true, // ⚠️ Only use this in development/testing (not recommended for production)
  // OR explicitly list trusted hosts:
  providers: [],
  basePath: "/api/auth",
  pages: {
    signIn: "",
    signOut: ""
  },
  
//   hosts: [
//     "console.power9inter.com",
//     "localhost:3000", // Include localhost if needed for development
//   ],
} satisfies NextAuthConfig;