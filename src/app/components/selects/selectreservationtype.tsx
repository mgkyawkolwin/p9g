import * as React from "react"

import { SelectWithLabel } from "@/lib/components/web/react/uicustom/selectwithlabel"

const selectData = new Map([
  ["NORMAL", "NORMAL"],
  ["TOUR", "Tour"],
  ["MEMBER", "Member"]
]);

export function SelectReservationType() {
  const [data, setData] = React.useState(new Map());

  React.useEffect(() => {
    setData(selectData);
  }
  ,[]);


  return ( 
    <SelectWithLabel label={"Reservation Type"} items={data}/>
  )
}
