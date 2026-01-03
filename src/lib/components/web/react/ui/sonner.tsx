"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "rgba(202, 247, 208, 1)",
          "--normal-text": "black",
          "--normal-border": "green",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
