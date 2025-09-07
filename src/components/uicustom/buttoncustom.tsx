import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/core/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md " 
  +"text-sm font-medium transition-all disabled:pointer-events-none "
  +"disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 "
  +"shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 "
  +"focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 "
  +"aria-invalid:border-destructive",
  {
    variants: {
      variant: {
        default:
          "bg-[#333333] dark:bg-[#666666] text-[#eeeeee] shadow-xs hover:bg-[#444444]",
        black:
            "bg-[#333333] dark:bg-[$666666] text-[#eeeeee] shadow-xs hover:bg-[#444444]",
        gray:
            "bg-[#666666] text-[#eeeeee] shadow-xs hover:bg-primary/90",
        red:
          "bg-[#cc0000] text-[#eeeeee] shadow-xs hover:bg-destructive/90 focus-visible:ring-destructive/20",
        green:
          "bg-[#008800] text-[#eeeeee] shadow-xs hover:bg-[#00aa00]",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 min-w-20 px-4 py-2 has-[>svg]:px-3",
        sm: "h-7 min-w-20 text-[10pt] p-2",
        lg: "h-10 min-w-20 rounded-md px-6 has-[>svg]:px-4",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function ButtonCustom({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { ButtonCustom, buttonVariants }
