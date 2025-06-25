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

interface SelectWithLabelProps extends React.ComponentProps<typeof Select>  {
    label: string;
    items: Map<string,string>
}


export function SelectWithLabel({label, items, ...props} : SelectWithLabelProps) {
  //const [dValue] = React.useState(defaultValue);
  return (
    <div className="flex gap-2">
        <Label>{label}</Label>
        <Select {...props}>
            <SelectTrigger className="w-auto min-h-4 border-gray-300">
                <SelectValue placeholder="Choose" />
            </SelectTrigger>
            <SelectContent className="">
                <SelectGroup>
                  {Array.from(items.entries()).map(([value,displayText]) => (
                    <SelectItem key={value} value={value}>{displayText}</SelectItem>
                  ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    </div>
  )
}
