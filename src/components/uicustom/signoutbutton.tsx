import { useActionState } from "react";
//Local Imports
import { Button } from "../ui/button";
import { FormState } from "@/lib/types";
 

export default function SignOutButton({action} : { action: () => Promise<FormState> }) {
    const [state, formAction] = useActionState(action, null);
    
  return (
    <form key={"signOutForm"} action={formAction} >
      <Button type="submit" >Sign Out</Button>
    </form>
  )
}