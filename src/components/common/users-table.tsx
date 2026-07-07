"use client";

import type { Column, ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";

import { DataTable } from "@/components/common/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useUsers } from "@/hooks/use-users";
import { formatDate } from "@/lib/utils";
import type { Role, User } from "@/types/auth";

function SortableHeader({
  column,
  label,
}: {
  column: Column<User, unknown>;
  label: string;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {label}
      <ArrowUpDown className="size-4" />
    </Button>
  );
}

// Map enum-ish values to Badge variants instead of branching in the cell
// renderer — adding a new role only touches this object.
const ROLE_VARIANT: Record<Role, "default" | "secondary" | "outline"> = {
  admin: "default",
  manager: "secondary",
  member: "outline",
};

// Columns live next to the feature that renders them (not inside DataTable):
// each table decides its own headers, cells and which columns are sortable.
const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => <SortableHeader column={column} label="Name" />,
  },
  {
    accessorKey: "email",
    header: ({ column }) => <SortableHeader column={column} label="Email" />,
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => (
      <Badge variant={ROLE_VARIANT[row.original.role]}>
        {row.original.role}
      </Badge>
    ),
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) =>
      row.original.active ? (
        <Badge variant="secondary">Active</Badge>
      ) : (
        <Badge variant="outline">Inactive</Badge>
      ),
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => <SortableHeader column={column} label="Created" />,
    cell: ({ row }) => formatDate(row.original.createdAt),
  },
];

export function UsersTable() {
  const { data, isPending } = useUsers();

  return (
    <DataTable
      columns={columns}
      data={data?.items ?? []}
      filterColumn="email"
      filterPlaceholder="Filter by email..."
      isLoading={isPending}
    />
  );
}
