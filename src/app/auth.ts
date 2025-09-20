import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
//import { hash } from "bcryptjs";

const formCredentials = Credentials({
    credentials: {
      id:{},
      name:{},
      role:{},
      location:{},sex:{}
    },
    authorize: async (credentials) => {
      // console.log('Authorize callback');
      // console.log(JSON.stringify(credentials));
      if(!credentials) return null;
      let user = null;
      user = {name:credentials.name, id:credentials.id, role: credentials.role, location: credentials.location};
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