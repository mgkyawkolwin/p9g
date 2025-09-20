
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/lib/components/web/react/ui/table";
import CurrencyTotal from "@/core/models/dto/CurrencyTotal";
import { Theme } from "@/core/constants";

export default function TotalTable({items}:{items:CurrencyTotal[]}) {

    return (
        <Table key={`table-${Math.random()}`} className={`w-auto ${Theme.Style.tableBg}`}>
            <TableHeader key={`header-${Math.random()}`}>
                <TableRow key={`headerrow-${Math.random()}`} className={`${Theme.Style.tableHeadBg} ${Theme.Style.tableHeadBorder}`}>
                    {
                        items?.map(item => {
                            return <TableHead key={`tablehead-${Math.random()}`} className={`${Theme.Style.tableHeadText}`}>{item.currency}</TableHead>
                        })
                    }
                </TableRow>
            </TableHeader>
            <TableBody key={`body-${Math.random()}`}>
                <TableRow key={`bodyrow-${Math.random()}`}>
                    {
                        items?.map(item => {
                            return <TableCell key={`tablecell-${Math.random()}`} className={`${Theme.Style.tableCellBorder} ${Theme.Style.tableCellText}`}>{item.total}</TableCell>
                        })
                    }
                </TableRow>
            </TableBody>
        </Table>
    );
}