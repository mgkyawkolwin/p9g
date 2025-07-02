"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { InputCustom } from "@/components/uicustom/inputcustom"

import { DayPicker } from "react-day-picker"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cva, type VariantProps } from "class-variance-authority";

const datepickerVariants = cva(
  "w-auto border-gray-300 bg-[#eeeeee]",
  {
    variants: {
      variant: {
        default: "min-h-4",
        form: "min-h-3"
      },
      size: {
        default: "h-9",
        sm: "max-h-7 text-[10pt]"
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface DatePickerCustomProps 
  extends Omit<React.ComponentProps<typeof DayPicker>, 'size'>, 
    VariantProps<typeof datepickerVariants> {

}

export function DatePickerCustom({
  variant,
  size
} : DatePickerCustomProps) {
  const [date, setDate] = React.useState<Date>()

  return (
    <div className="flex">
        <InputCustom className="text-center" variant={variant} size={size} placeholder="yyyy-mm-dd" defaultValue={date?.toDateString()} />
        <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"ghost"}
          className={cn(
            "size-fit",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="h-8 w-8" />
          
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          initialFocus
        />
      </PopoverContent>
    </Popover>
    </div>
  )
}