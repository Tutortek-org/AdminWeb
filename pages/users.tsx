import SimpleLayout from "../components/layout/simple";
import React from "react";
import { Column, useTable } from "react-table";
import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { AppProps } from "next/dist/shared/lib/router/router";
import { Button } from "react-bootstrap";
import { User } from "../interfaces/user";
import BanButton from "../components/buttons/ban-button";

interface Props {
  users: User[];
}

export default function Users({ users }: AppProps & Props) {
  const { data: session } = useSession();
  const [data, setData] = React.useState(users);
  // const data = React.useMemo(() => users, [users]);

  const columns: Column<{ id: number; email: string; isBanned: boolean }>[] =
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

  const toggleBan = async (id: number, isBanned: boolean) => {
    try {
      const res = await fetch(
        `/tutortek-api/users/${id}/${isBanned ? "unban" : "ban"}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const updatedUser: Partial<User> = await res.json();

      if (updatedUser?.id) {
        const index = data.findIndex((user) => user.id === updatedUser.id);

        setData((prevData) => {
          const newData = [...prevData];
          newData[index] = {
            ...newData[index],
            ...updatedUser,
          };
          return newData;
        });
      }
    } catch (e) {
      // TODO: handle error failed to ban
      console.error(e);
    }
  };

  return (
    <SimpleLayout>
      <table
        {...getTableProps()}
        className="table table-striped table-bordered table-hover"
      >
        <thead className="thead-dark">
          {headerGroups.map((headerGroup) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              key={headerGroup.getHeaderGroupProps().key}
            >
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps()}
                  key={column.getHeaderProps().key}
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
              <tr {...row.getRowProps()} key={row.getRowProps().key}>
                {row.cells.map((cell) => {
                  const { key, ...cellProps } = cell.getCellProps();
                  return (
                    <td key={key} {...cellProps}>
                      {cell.column.id === "isBanned" && (
                        <BanButton
                          isBanned={row.original.isBanned}
                          handleBan={() =>
                            toggleBan(row.original.id, row.original.isBanned)
                          }
                        />
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

  // TODO: try catch and assert that its users array
  const users: Array<User> = await res.json();

  console.log(users);

  return {
    props: { users },
  };
};
