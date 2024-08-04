"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table"
import {ArrowUpDown, Edit3, MoreHorizontal, Plus, RefreshCw, Trash2} from "lucide-react"

import {Button} from "@/components/ui/button"
import {Checkbox} from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {Input} from "@/components/ui/input"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {
  InventoryDataProviderLoadingState,
  StatfulInventoryItem,
  useInventory
} from "@/components/providers/inventory-data-provider";
import {cn} from "@/lib/utils";
import {ModalType, useModal} from "@/hooks/use-modal";

export const columns: ColumnDef<StatfulInventoryItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        disabled={row.original.state != "Idle"}
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const data = row.original;
      return <div className={cn("pl-4" , data.state != "Idle" && "opacity-30")}>{row.getValue("name")}</div>
    },
  },
  {
    accessorKey: "count",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const data = row.original
      const amount = parseInt(row.getValue("count"))
      return <div className={cn("text-right font-medium" , data.state != "Idle" && "opacity-30")}>{amount}</div>
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const data = row.original

      const modal = useModal();

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 ml-auto" disabled={data.state != "Idle"}>
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(`${data.id}`)}
            >
              Copy ID
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className={"text-indigo-500"} onClick={() => {
              modal.open(ModalType.EDIT_ITEM , {
                id: `${data.id}`,
                name: data.name,
                count: data.count,
              })
            }}>
              <Edit3 size={16} className={"mr-4"}/>
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className={"text-rose-700"}>
              <Trash2 size={16} className={"mr-4"}/>
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function InventoryItemsTable() {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

  const inv = useInventory();
  const modal = useModal();
  const table = useReactTable({
    data: inv.data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  const deleteSelected = () => {
    const selected = table.getSelectedRowModel();
    let ids = [] as StatfulInventoryItem[];
    for (const item of selected.rows){
      ids.push(item.original);
    }
    ids.filter((i) => i.id != -1);
    modal.open(ModalType.DELETE_ITEMS , {
      items: ids,
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="flex gap-1">
          <Input
            placeholder="Filter names..."
            value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("name")?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />


          <Button variant="outline" disabled={!(table.getIsSomePageRowsSelected() || table.getIsAllPageRowsSelected())} onClick={deleteSelected}>
            <Trash2 size={16} className={"mr-4"}/>
            Remove Selected
          </Button>
        </div>

        <div className="flex gap-1 ml-auto">
          <Button variant="outline" size="icon" disabled={inv.state == InventoryDataProviderLoadingState.Loading} onClick={() => {
            inv.reloadData()
          }}>
            <RefreshCw className={cn(
              "w-4 h-4",
              inv.state == InventoryDataProviderLoadingState.Loading && "animate-spin"
            )}/>
          </Button>

          <DropdownMenu>
            <Button variant="outline" onClick={
              () => {
                modal.open(ModalType.ADD_ITEM);
              }
            }>
              Add item <Plus className="ml-2 h-4 w-4"/>
            </Button>
          </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
            {(table.getRowModel().rows?.length) ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.original.id != -1 ? row.original.id : row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                {(
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
