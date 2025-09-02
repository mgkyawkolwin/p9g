"use client"

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import c from "@/lib/core/logger/ConsoleLogger";
import { Theme } from "@/lib/constants";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}


export default function BillDataTable<TData, TValue>({
  columns,
  data
}: DataTableProps<TData, TValue>) {

  c.i("DataTable is called.");
  c.d(JSON.stringify(data));
  

  //Table Related
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const defaultData = React.useMemo(() => [], [])

  const table = useReactTable({
    data: data ?? defaultData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnFilters,
      columnVisibility,
    },
    autoResetPageIndex: true,
    debugTable: true,
  });


  return (
    <div className="flex gap-y-4 w-full">
      <Table className={`border w-full ${Theme.Style.tableBg}`}>
        <TableHeader className={`${Theme.Style.tableHeadBg}`}>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow className={`border-b-1 ${Theme.Style.tableHeadBorder}`} key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id} className={`${Theme.Style.tableHeadText}`}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                  </TableHead>
                )
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
                <TableRow className={`border-b-1 ${Theme.Style.tableCellBorder}`} id={row.id}
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={`${Theme.Style.tableCellText}`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className={`h-24 text-center ${Theme.Style.tableCellText}`}>
                No data.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
  </div>
  )
}
