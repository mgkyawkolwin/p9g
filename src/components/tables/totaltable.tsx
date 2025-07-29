
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
        <Table key={`table-${Math.random()}`} className="w-auto ">
            <TableHeader key={`header-${Math.random()}`}>
                <TableRow key={`headerrow-${Math.random()}`} className="bg-[#eee]">
                    {
                        items?.map(item => {
                            return <TableHead>{item.currency}</TableHead>
                        })
                    }
                </TableRow>
            </TableHeader>
            <TableBody key={`body-${Math.random()}`}>
                <TableRow key={`bodyrow-${Math.random()}`}>
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