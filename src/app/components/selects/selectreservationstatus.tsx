import * as React from "react"

import { SelectWithLabel } from "@/components/uicustom/selectwithlabel"

const selectData = new Map([
  ["NEW", "NEW"],
  ["CIN", "CIN"],
  ["OUT", "OUT"],
  ["CCL", "CCL"]
]);

export function SelectReservationStatus() {
  const [data, setData] = React.useState(new Map());

  React.useEffect(() => {
    setData(selectData);
  }
  ,[]);


  return ( 
    <SelectWithLabel label={"Reservation Status"} items={data}/>
  )
}
