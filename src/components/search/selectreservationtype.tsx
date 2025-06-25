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

export function SelectReservationType() {
  return ( 
    <SelectWithLabel label={"Type"} />
  )
}
