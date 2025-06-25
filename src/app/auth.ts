import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { hash } from "bcryptjs"
import { string } from "zod";

const formCredentials = Credentials({
    credentials: {
      userName: {
      },
      role: {
      }
    },
    authorize: async (credentials) => {
      let user = null;
      user = {name:credentials.userName, role: credentials.role};
      

      // return user object with their profile data
      return user;
    },
    
  
  });
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  debug : true,
  providers: [
    formCredentials
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) { // User is available during sign-in
        token.role = user.role;
      }
      // console.log('jwt Callback');
      // console.log(token);
      // console.log(user);
      return token
    },
    session({ session, token }) {
      // console.log('session Callback');
      // console.log(session);
      // console.log(token);
      session.user.role = token.role;
      return session
    },
  },
})