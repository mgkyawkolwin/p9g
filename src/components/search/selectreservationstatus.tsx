import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { SelectWithLabel } from "@/components/uicustom/selectwithlabel"

export function SelectReservationStatus() {
  return ( 
    <SelectWithLabel label={"Reservation Status"} />
  )
}
