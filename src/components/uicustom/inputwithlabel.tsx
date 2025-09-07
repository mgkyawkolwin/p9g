import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/core/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { InputCustom } from "./inputcustom";

const inputVariants = cva(
  "w-[100] border-gray-300 bg-[#eeeeee]",
  {
    variants: {
      variant: {
        default: "bg-[#eeeeee] min-h-8",
        form: "h-7 max-h-7 text-[10pt]",
        table: "h-5 max-h-5 text-[10pt] bg-[#eaeaea] text-[#333333] border-[#bbbbbb]"
      },
      size: {
        default: "bg-[#eeeeee] w-min-50",
        full: "w-full max-w-full",
        xxl: "w-70 max-w-70",
        xl: "w-60 max-w-60",
        lg: "w-50 max-w-50",
        md: "w-40 max-w-40",
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

interface InputWithLabelProps 
  extends Omit<React.ComponentProps<"input">, 'size'>, 
    VariantProps<typeof inputVariants> {
  label?: string;
  labelPosition?: "top" | "left";
}

function InputWithLabel({ 
  className,
  variant,
  size,
  label = 'Label',
  labelPosition = "left",
  type = "text",
  ...props 
}: InputWithLabelProps) {
  return (
   <div className={cn('flex gap-1', labelPosition == "left" ? "flex-row" : "flex-col" )}>
      <Label className={cn(className,labelPosition === "top" ? "mb-1" : "","whitespace-nowrap")}>{label}</Label>
      
      <InputCustom
        type={type}
        className={inputVariants({ variant, size, className })} variant={variant} size={size}
        {...props}
      />
    </div>
  );
}

export { InputWithLabel };