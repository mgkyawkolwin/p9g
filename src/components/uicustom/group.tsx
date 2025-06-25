import * as React from "react"

import { cn } from "@/lib/utils"

function Group({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border p-6 shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function GroupTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("leading-none font-bold text-2xl", className)}
      {...props}
    />
  )
}

function GroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("", className)}
      {...props}
    />
  )
}

export {
  Group,
  GroupTitle,
  GroupContent
}
