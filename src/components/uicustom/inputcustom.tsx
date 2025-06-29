import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "w-[100] border-gray-300 bg-[#eeeeee]",
  {
    variants: {
      variant: {
        default: "min-h-4",
        form: "min-h-3",
        table: "bg-[#eaeaea] text-[#333333] border-[#bbbbbb]"
      },
      size: {
        default: "h-9",
        sm: "max-h-7 text-[10pt]"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface InputCustomProps 
  extends Omit<React.ComponentProps<"input">, 'size'>, 
    VariantProps<typeof inputVariants> {
}

function InputCustom({ 
  className,
  variant,
  size,
  type = "text",
  ...props 
}: InputCustomProps) {
  return (
    <Input
      type={type}
      className={inputVariants({ variant, size, className })}
      {...props}
    />
  )
}

export { InputCustom }
