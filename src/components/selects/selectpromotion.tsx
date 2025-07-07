import * as React from "react"

import { SelectWithLabel } from "@/components/uicustom/selectwithlabel"

const selectData = new Map([
    ["NORMAL", "Normal"],
  ["NINETYDAYS", "90 Days"]
]);

export function SelectPromotion() {
  const [data, setData] = React.useState(new Map());

  React.useEffect(() => {
    setData(selectData);
  }
  ,[]);


  return ( 
    <SelectWithLabel label={"Promotions"} items={data}/>
  )
}
