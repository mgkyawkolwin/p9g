import * as React from "react"

import { DatePickerCustom } from '@/lib/components/web/react/uicustom/datepickercustom';
import { Label } from "@/lib/components/web/react/ui/label"

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
