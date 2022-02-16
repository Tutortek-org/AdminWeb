import SimpleLayout from "../components/layout/simple";
import React from "react";
import { Column, useTable } from "react-table";
import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import { AppProps } from "next/dist/shared/lib/router/router";
import { Button } from "react-bootstrap";

interface User {
  id: number;
  email: string;
  isBanned: boolean;
}

export default function Users({ users }: AppProps) {
  const data = React.useMemo(() => users, [users]);

  const columns: Column<{ id: string; email: string; isBanned: boolean }>[] =
    React.useMemo(
      () => [
        { Header: "ID", accessor: "id" },
        { Header: "E-mail", accessor: "email" },
        { Header: "Actions", accessor: "isBanned" },
      ],
      []
    );

  const tableInstance = useTable({ columns, data });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <SimpleLayout>
      <table
        {...getTableProps()}
        className="table table-striped table-bordered table-hover"
      >
        <thead className="thead-dark">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  key={headerGroup.id}
                  scope="col"
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={row.id}>
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()} key={cell.getCellProps().key}>
                      {cell.column.id === "isBanned" && (
                        <Button
                          variant={
                            cell.row.original.isBanned ? "success" : "danger"
                          }
                        >
                          Ban
                        </Button>
                      )}
                      {cell.render("Cell")}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </SimpleLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/users`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session?.accessToken}`,
    },
  });

  const users: Array<User> = await res.json();

  return {
    props: { users },
  };
};
