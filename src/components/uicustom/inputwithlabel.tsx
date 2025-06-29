import * as React from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { InputCustom } from "./inputcustom";

const inputVariants = cva(
  "w-[150] border-gray-300 bg-[#eeeeee]",
  {
    variants: {
      variant: {
        default: "min-h-4",
        form: "min-h-3"
      },
      size: {
        default: "h-9",
        sm: "max-h-7 text-[10pt]",
        xs: "max-h-7 max-w-20 text-[10pt]"
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
    <div className={cn(
      "flex w-auto gap-2 items-center",
      labelPosition === "top" ? "flex-col items-start" : "flex-row"
    )}>
      <Label 
        className={cn("whitespace-nowrap", labelPosition === "top" ? "mb-1" : "")}
      >
        {label}
      </Label>
      <InputCustom
        type={type}
        className={inputVariants({ variant, size, className })}
        {...props}
      />
    </div>
  );
}

export { InputWithLabel };