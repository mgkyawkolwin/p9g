'use client';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
  import { Button } from "@/components/ui/button"
import { FormState } from "@/lib/types";
  
  export function AlertDialogDemo({show, title, content, action, params}:{show:boolean, title:string,content:string,action:()=>Promise<FormState>,params:any}) {
    return (
      <AlertDialog open={show}>
        <AlertDialogContent>
            <form>
                <AlertDialogHeader>
                <AlertDialogTitle>{title}</AlertDialogTitle>
                <AlertDialogDescription>
                {content}
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction type="submit">Continue</AlertDialogAction>
                </AlertDialogFooter>
            </form>
          
        </AlertDialogContent>
      </AlertDialog>
    )
  }
  