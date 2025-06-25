import * as React from "react"

import { DatePickerCustom } from '@/components/uicustom/datepickercustom';
import { Label } from "@/components/ui/label"

export function InputDateRange() {
  return (
    <div className="flex gap-2">
        <Label>Date</Label>
        <DatePickerCustom/>
        <Label>-</Label>
        <DatePickerCustom />
        
    </div>
  )
}
