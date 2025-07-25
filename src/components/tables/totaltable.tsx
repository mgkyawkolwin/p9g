
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import CurrencyTotal from "@/domain/dtos/CurrencyTotal";

export default function TotalTable({items}:{items:CurrencyTotal[]}) {

    return (
        <Table className="w-auto ">
            <TableHeader>
                <TableRow key="headerrow" className="bg-[#eee]">
                    {
                        items?.map(item => {
                            return <TableHead>{item.currency}</TableHead>
                        })
                    }
                </TableRow>
            </TableHeader>
            <TableBody>
                <TableRow key="bodyrow">
                    {
                        items?.map(item => {
                            return <TableCell>{item.total}</TableCell>
                        })
                    }
                </TableRow>
            </TableBody>
        </Table>
    );
}