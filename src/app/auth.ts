import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { readSignInTicket } from "@/core/auth/SignInTicket";

// Only a server-issued, signed and short-lived ticket is accepted.
// Identity fields are never taken from the client.
const formCredentials = Credentials({
    credentials: {
      ticket:{}
    },
    authorize: async (credentials) => {
      if(!credentials || typeof credentials.ticket !== "string") return null;
      const payload = await readSignInTicket(credentials.ticket);
      if (!payload) return null;
      return { id: payload.id, name: payload.name, role: payload.role, location: payload.location };
    },
  });
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  debug : process.env.NODE_ENV !== "production",
  providers: [
    formCredentials
  ],
  callbacks: {
    jwt({ token, user, account, profile }) {
      // console.log('jwt Callback');
      // console.log(token);
      // console.log(user);
      // console.log(account);
      // console.log(profile);
      if(user){
        const u = user as unknown as any;
        //initial call
        token.id = user.id;
        token.name = user.name;
        token.location = user.location;
        token.role = user.role;
      }
      return token
    },
    session({ session, token , user}) {
      // console.log('session Callback');
      // console.log(session);
      // console.log(token);
      // console.log(user);
      session.user.id = String(token.id);
      session.user.name = token.name;
      session.user.role = token.role as string;
      session.user.location = token.location as string;
      return session
    },
  },
})