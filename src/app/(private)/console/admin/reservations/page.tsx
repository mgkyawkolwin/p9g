import { Search as SearchIcon } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { SelectReservationStatus } from "@/components/search/selectreservationstatus"
import { SelectReservationType } from "@/components/search/selectreservationtype"
import { SelectPromotion } from "@/components/search/selectpromotion"
import { InputDateRange } from "@/components/uicustom/inputdaterange"
import { DatePickerCustom } from "@/components/uicustom/datepickercustom"
import { InputWithLabel } from "@/components/uicustom/inputwithlabel"
import { Group, GroupTitle,GroupContent } from "@/components/uicustom/group"
import ReservationTable from "@/components/tables/reservationtable"
import { TableButton } from "@/components/uicustom/tablebutton"
import UserListTable from "@/components/tables/userlisttable"

export default function Reservations() {
  return (
    <Group className="w-full max-w-100vw">
      <GroupTitle>Reservation List</GroupTitle>
      <GroupContent>
        <form>
          <div className="flex flex-col gap-6">
            <div className="flex flex-row gap-4">
                <InputDateRange/>
            </div>
            <div className="flex flex-row gap-4">
                <InputWithLabel label="Reservation ID" className="w-[100px]" />
                <InputWithLabel label="Guest Name" className="w-[150px]" />
                <InputWithLabel label="No of Days" className="w-[50px]" />
                <Button>
                    <SearchIcon/> Search
                </Button>
                <TableButton>Table Button</TableButton>xxx
            </div>
            <ReservationTable />
          </div>
        </form>
      </GroupContent>
    </Group>
  )
}
