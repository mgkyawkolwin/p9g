import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

//buttonVariants.variant.size.default = "h-4 px-2 py-4 has-[>svg]:px-3";


function TableButton({
  className,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Button variant={"default"} size={"default"}
      className={ "bg-red-800 h-8 px-4 py-2" }
      {...props}
    />
  )
}

export { TableButton }
