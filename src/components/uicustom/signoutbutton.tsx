import { useActionState } from "react";
//Local Imports
import { Button } from "../ui/button";
import { FormState } from "@/lib/types";
import { ButtonCustom } from "./buttoncustom";
 

export default function SignOutButton({action} : { action: () => Promise<FormState> }) {
    const [state, formAction] = useActionState(action, null);
    
  return (
    <form key={"signOutForm"} action={formAction} >
      <ButtonCustom type="submit" variant={"red"} size={"sm"} >Sign Out</ButtonCustom>
    </form>
  )
}