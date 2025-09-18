import { useActionState } from "react";
import { FormState } from "@/core/types";
import { ButtonCustom } from "./buttoncustom";
 

export default function SignOutButton({action} : { action: () => Promise<FormState> }) {
    const [state, formAction] = useActionState(action, null);
    console.log(state);
    
  return (
    <form key={"signOutForm"} action={formAction} >
      <ButtonCustom type="submit" variant={"red"} size={"sm"} >Sign Out</ButtonCustom>
    </form>
  )
}