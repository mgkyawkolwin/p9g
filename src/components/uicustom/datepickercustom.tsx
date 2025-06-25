"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { InputCustom } from "@/components/uicustom/inputcustom"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DatePickerCustom() {
  const [date, setDate] = React.useState<Date>()

  return (
    <div className="flex">
        <InputCustom className="w-[120px] text-center" placeholder="yyyy-mm-dd" value={date?.toDateString()}/>
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