"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import {
  ColumnDef,
  ColumnFiltersState,
  PaginationState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import c from "@/lib/core/logger/ConsoleLogger"
import { SelectWithLabel } from "../uicustom/selectwithlabel"
import { FormState } from "@/lib/types"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  formState: FormState;
  formAction: (formData: FormData) => void;
  formRef: React.RefObject<HTMLFormElement | null>;
}


export default function DataTable<TData, TValue>({
  columns,
  formState,
  formAction,
  formRef,
}: DataTableProps<TData, TValue>) {

  c.i("DataTable is called.");
  c.d(JSON.stringify(formState));

  const [data, setData] = React.useState([]);
  const [pageIndex, setPageIndex] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(10);
  const [orderBy, setOrderBy] = React.useState("createdAtUTC");
  const [orderDirection, setOrderDirection] = React.useState("asc");
  const [records, setRecords] = React.useState(0);
  const [pageIndexList, setPageIndexList] = React.useState(new Map<string, string>([["10", "10"]]));

  //Filter related
  const pageSizeList = new Map<string, string>([
    ["10", "10"],
    ["20", "20"],
    ["30", "30"],
    ["50", "50"]
  ]);

  //Table Related
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const defaultData = React.useMemo(() => [], [])

  const table = useReactTable({
    data: formState.data ?? defaultData,
    columns,
    //rowCount: 6,
    //pageCount: formState.pager?.pages,
    getCoreRowModel: getCoreRowModel(),
    //getPaginationRowModel: getPaginationRowModel(),
    //onPaginationChange: setPagination,
    manualPagination: true,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      //pagination,
    },
    autoResetPageIndex: true,
    debugTable: true,
  });


  React.useEffect(() => {
    c.i("formState is changed.");
    //setData(formState.data);
    if(records !== formState.pager?.records)
      setRecords(formState.pager?.records ?? 0);
    if(pages !== formState.pager?.pages){
      setPages(formState.pager?.pages ?? 0);
      //reset page index if pages is changed
      setPageIndex(1);
    }
      
    c.d(data);
  }, [formState]);


  React.useEffect(() => {
    c.i("pages is changed.");
    const temp = new Map<string, string>();
    //rebuid pages
    for (let x = 1; x <= pages; x++) {
      temp.set(String(x), String(x));
    }
    setPageIndexList(temp);
  }, [pages]);

  
  React.useEffect(() => {
    formRef?.current?.requestSubmit();
  }, [pageIndex]);

  
  React.useEffect(() => {
    setPageIndex(1);
    formRef?.current?.requestSubmit();
  }, [pageSize]);


  return (
      <div>
      <div className="flex flex-col gap-y-4 w-full max-w-full">
        <div className="flex">
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                Show/Hide Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter(
                  (column) => column.getCanHide()
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  )
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex max-w-full">
              <Table className="bg-[#e3e3e3] rounded-xl w-full">
                <TableHeader className="bg-[#dddddd] rounded-t-xl border-b-2 border-b-[#aaaaaa]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className=" text-[#444444]">
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
                    <TableRow id={row.id}
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="align-top text-[#333333]">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No data.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex flex-row justify-between">
          <div className="flex gap-x-2">
            <SelectWithLabel label="Records Per Page:"
              name="pageSizex"
              items={pageSizeList}
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
              }}
            />
            <SelectWithLabel label="Page No:"
              name="pageIndexx"
              items={pageIndexList}
              value={String(pageIndex)}
              onValueChange={(value) => {
                setPageIndex(Number(value));
              }}
            />
          </div>
          <div>
            <span className="flex items-center gap-1">
              <div>Showin page </div>
              <strong>
                {pageIndex}
              </strong>
              of
              <strong>
                {pages}
              </strong>.&nbsp;
              <div>
                Total records:&nbsp;
                <strong>
                  {records}
                </strong>
                &nbsp;
              </div>
            </span>
          </div>
          <div className="flex gap-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex(1)}
              disabled={pageIndex == 1}
            >
              First
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex(pageIndex - 1)}
              disabled={pageIndex === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex(pageIndex + 1)}
              disabled={pageIndex == pages}
            >
              Next
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex(pages)}
              disabled={pageIndex == pages}
            >
              Last
            </Button>
          </div>
        </div>
      </div>
      <input type="hidden" name="pageIndex" value={pageIndex} />
      <input type="hidden" name="pageSize" value={pageSize} />
      <input type="hidden" name="orderBy" value={sorting[0]?.id ?? 'createdAtUTC'} />
      <input type="hidden" name="orderDirection" value={sorting[0]?.desc ? "desc" : "asc"} />
      </div>
  )
}
