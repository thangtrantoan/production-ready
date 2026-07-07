import type { ColumnDef } from "@tanstack/react-table";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DataTable } from "@/components/common/data-table";

interface Item {
  name: string;
  email: string;
}

const columns: ColumnDef<Item>[] = [
  { accessorKey: "name", header: "Name" },
  { accessorKey: "email", header: "Email" },
];

const data: Item[] = Array.from({ length: 12 }, (_, index) => ({
  name: `Person ${index + 1}`,
  email: `person${index + 1}@example.com`,
}));

describe("DataTable", () => {
  it("paginates rows with the default page size of 10", async () => {
    const user = userEvent.setup();
    render(<DataTable columns={columns} data={data} />);

    expect(screen.getByText("Person 1")).toBeInTheDocument();
    expect(screen.queryByText("Person 11")).not.toBeInTheDocument();
    expect(screen.getByText(/page 1 of 2/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /next/i }));

    expect(screen.getByText("Person 11")).toBeInTheDocument();
    expect(screen.queryByText("Person 1")).not.toBeInTheDocument();
  });

  it("filters rows through the filter input", async () => {
    const user = userEvent.setup();
    render(
      <DataTable
        columns={columns}
        data={data}
        filterColumn="email"
        filterPlaceholder="Filter by email..."
      />,
    );

    await user.type(
      screen.getByPlaceholderText(/filter by email/i),
      "person12@",
    );

    expect(screen.getByText("Person 12")).toBeInTheDocument();
    expect(
      screen.queryByText("Person 1", { exact: true }),
    ).not.toBeInTheDocument();
  });
});
