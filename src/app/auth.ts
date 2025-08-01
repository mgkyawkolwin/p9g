import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
//import { hash } from "bcryptjs";

const formCredentials = Credentials({
    credentials: {
      id:{},
      name:{},
      role:{}
    },
    authorize: async (credentials) => {
      console.log('Authorize callback');
      console.log(JSON.stringify(credentials));
      let user = null;
      user = {name:credentials.name, id:credentials.id, role: credentials.role};
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
      console.log('jwt Callback');
      console.log(token);
      console.log(user);
      if(user){
        //initial call
        token.id = user.id;
        token.name = user.name;
      }
      return token
    },
    session({ session, token }) {
      console.log('session Callback');
      console.log(session);
      console.log(token);
      session.user.id = String(token.id);
      session.user.name = token.name;
      //session.user.role = token.role;
      return session
    },
  },
})