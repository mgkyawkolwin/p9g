// types/next-auth.d.ts
import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    name?: string | null;
    role?: string;
    location?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      role?: string;
      location?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name?: string;
    role?: string;
    location?: string;
  }
}