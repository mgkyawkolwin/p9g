import * as React from "react"

import { Input } from "@/components/ui/input";
import { cva, type VariantProps } from "class-variance-authority";

const inputVariants = cva(
  "w-[100] border-gray-300 bg-[#eeeeee]",
  {
    variants: {
      variant: {
        default: "min-h-8",
        form: "h-7 max-h-7 text-[10pt]",
        table: "h-6 max-h-6 text-[10pt] bg-[#eaeaea] text-[#333333] dark:text-[#dddddd] border-[#bbbbbb]"
      },
      size: {
        default: "",
        full: "w-full max-w-full",
        xxl: "w-55 max-w-55",
        xl: "w-50 max-w-50",
        lg: "w-45 max-w-45",
        md: "w-35 max-w-35",
        sm: "w-30 max-w-30",
        xs: "w-20 max-w-20",
        xxs: "w-10 max-w-10"
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
