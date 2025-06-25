import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { InputCustom } from "@/components/uicustom/inputcustom";

interface InputWithLabelProps extends React.ComponentProps<"input"> {
    label: string;
}

function InputWithLabel({ className, label, type, ...props }: InputWithLabelProps) {
  return (
    <div className="flex w-auto gap-2 items-center">
        <Label className="whitespace-nowrap" htmlFor="{props.id}">{label}</Label>
        <InputCustom
        id="{props.id}"
        type={type}
        className={
            className}
        {...props}
        />
    </div>
  )
}

export { InputWithLabel }
