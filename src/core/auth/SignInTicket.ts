import { encode, decode } from "next-auth/jwt";

// Short-lived, server-signed, encrypted ticket issued by the sign-in API after
// the password is verified. The credentials provider only accepts this ticket,
// so the client can never supply identity fields (name, id, role, location) directly.
const TICKET_SALT = "p9g-signin-ticket";
const TICKET_MAX_AGE_SECONDS = 60;

export interface SignInTicketPayload {
  id: string;
  name: string;
  role: string;
  location: string;
}

function getTicketSecret(): string {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured.");
  return secret;
}

export async function createSignInTicket(payload: SignInTicketPayload): Promise<string> {
  return encode<SignInTicketPayload>({
    token: {
      id: String(payload.id),
      name: String(payload.name),
      role: String(payload.role),
      location: String(payload.location ?? ""),
    },
    secret: getTicketSecret(),
    salt: TICKET_SALT,
    maxAge: TICKET_MAX_AGE_SECONDS,
  });
}

export async function readSignInTicket(ticket: string): Promise<SignInTicketPayload | null> {
  if (!ticket || typeof ticket !== "string") return null;
  try {
    const decoded = await decode<SignInTicketPayload>({
      token: ticket,
      secret: getTicketSecret(),
      salt: TICKET_SALT,
    });
    if (!decoded || !decoded.id || !decoded.name || !decoded.role) return null;
    return {
      id: String(decoded.id),
      name: String(decoded.name),
      role: String(decoded.role),
      location: String(decoded.location ?? ""),
    };
  } catch {
    return null;
  }
}
