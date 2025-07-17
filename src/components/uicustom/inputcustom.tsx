import * as React from "react"

import { Input } from "@/components/ui/input";
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
        full: "w-full max-w-full",
        xxl: "max-h-7 text-[10pt] w-70 max-w-70",
        xl: "max-h-7 text-[10pt] w-60 max-w-60",
        lg: "max-h-7 text-[10pt] max-w-50",
        md: "max-h-7 text-[10pt] max-w-40",
        sm: "max-h-7 text-[10pt] max-w-30",
        xs: "max-h-7 text-[10pt] max-w-20",
        xxs: "max-h-7 text-[10pt] max-w-10"
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
