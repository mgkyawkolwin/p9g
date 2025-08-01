import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

import { cva, type VariantProps } from "class-variance-authority";

const selectVariants = cva(
  "w-auto border-gray-300",
  {
    variants: {
      variant: {
        default:
          "min-h-4",
        form:
          "min-h-3"
      },
      size: {
        default: "h-9",
        sm: "max-h-7 text-[10pt]",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
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
