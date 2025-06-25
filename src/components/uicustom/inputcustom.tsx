import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

function InputCustom({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <Input
      type={type}
      className={cn(
        "h-8 border-gray-300",
        className
      )}
      {...props}
    />
  )
}

export { InputCustom }
