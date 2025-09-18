import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/lib/components/web/react/ui/select";
import { cn } from "@/lib/utils";

import { cva, type VariantProps } from "class-variance-authority";

const selectVariants = cva(
  "w-auto border-gray-300",
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
)

interface SelectCustomProps extends Omit<React.ComponentProps<typeof Select>, 'size'>,
VariantProps<typeof selectVariants>  {
    className?: string;
    items?: Map<string,string>;
}


export function SelectCustom({
  className,
  variant,
  size,
  items = new Map(), 
  ...props} : SelectCustomProps) {
  
  return (
    <div className={'flex gap-2 items-start'}>
        <Select {...props}>
            <SelectTrigger className={cn(selectVariants({ variant, size, className }))}>
                <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent >
                <SelectGroup>
                  {Array.from(items.entries()).map(([value,displayText]) => (
                    <SelectItem key={value} value={value}>{displayText}</SelectItem>
                  ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    </div>
  )
}
