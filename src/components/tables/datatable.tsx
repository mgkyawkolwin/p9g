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
import consoleLogger from "@/lib/core/logger/ConsoleLogger"
import { SelectWithLabel } from "../uicustom/selectwithlabel"
import { FormState } from "@/lib/types"
import { Loader } from "../uicustom/loader"


interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[]
  formState: FormState;
  formAction: (formData: FormData) => void;
  isPending: boolean;
}



export default function DataTable<TData, TValue>({
  columns,
  data,
  formState,
  formAction,
  isPending
}: DataTableProps<TData, TValue>) {

  consoleLogger.logInfo("DataTable is called.");
  consoleLogger.logDebug(JSON.stringify(formState));

  const [pageIndex, setPageIndex] = React.useState(1);
  const [pages, setPages] = React.useState(1);
  const [pageSize, setPageSize] = React.useState(2);
  const [orderBy, setOrderBy] = React.useState("id");
  const [orderDirection, setOrderDirection] = React.useState("asc");
  const [pageIndexList, setPageIndexList] = React.useState(new Map<string, string>([["1", "1"]]));

  const formRef = React.useRef<HTMLFormElement>(null);

  //Filter related
  const itemsPerPageMap = new Map<string, string>([
    ["1", "1"],
    ["2", "2"],
    ["3", "3"],
    ["4", "4"],
    ["5", "5"],
    ["10", "10"],
    ["20", "20"],
    ["30", "30"]
  ]);

  //Table Related
  const [sorting, setSorting] = React.useState<SortingState>([{id:"id",desc:false}]);
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
    consoleLogger.logInfo("sorting is called.");
    consoleLogger.logDebug(sorting);
  }, [sorting]);


  React.useEffect(() => {
    consoleLogger.logInfo("useEfect is called.");
    if (!formState.data) {
      consoleLogger.logInfo("Form is submitted");
      React.startTransition(() => {
      });
    }
  }, []);


  React.useEffect(() => {
    consoleLogger.logInfo("formState is changed.");
    setPages(formState.pager?.pages ?? 1);
  }, [formState]);


  React.useEffect(() => {
    consoleLogger.logInfo("pages is changed.");
    const temp = new Map<string, string>();
    //rebuid pages
    for (let x = 1; x <= pages; x++) {
      temp.set(String(x), String(x));
    }
    setPageIndexList(temp);
  }, [pages]);

  
  React.useEffect(() => {
    consoleLogger.logInfo("pagination is changed.");
    consoleLogger.logDebug(pageIndex);
    consoleLogger.logDebug(pageSize);
    consoleLogger.logDebug(pages);
    consoleLogger.logDebug(orderBy);
    consoleLogger.logDebug(orderDirection);
    formRef.current?.requestSubmit();
  }, [pageSize, pageIndex]);

  return (
    <form className="flex flex-1" ref={formRef} action={formAction}>
      <Loader isLoading={isPending} />
      <div className="flex flex-1 flex-col gap-y-4">
        <div className="flex">
          <Input
            placeholder="enter search values ..."
            value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("email")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
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
        <div className="flex">
          <Table className="bg-[#dddddd] rounded-xl">
            <TableHeader className="border-b-2 border-b-[#cccccc]">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className=" text-[#333333]">
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
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-[#333333]">
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
              items={itemsPerPageMap}
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
                  {pageSize * pages}
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
      <input type="hidden" name="orderBy" value={sorting[0].id} />
      <input type="hidden" name="orderDirection" value={sorting[0].desc ? "desc" : "asc"} />
    </form>
  )
}
