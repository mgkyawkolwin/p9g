'use server';
import { signInAction } from "./actions"
import SignIn from "./SignIn";

export default async function SignInPage() {
  
  return (
    <SignIn action={signInAction} />
  )
}