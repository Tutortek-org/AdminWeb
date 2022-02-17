import SimpleLayout from "../components/layout/simple";
import React from "react";
import { Column, useTable } from "react-table";
import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { AppProps } from "next/dist/shared/lib/router/router";
import { User } from "../interfaces/user";
import BanButton from "../components/buttons/ban-button";
import { UserTableData } from "../interfaces/user-table-data";
import { UserFlags } from "../interfaces/user-flags";

interface Props {
  users: User[];
  isErrorPresent: Boolean;
}

export default function Users({ users, isErrorPresent }: AppProps & Props) {
  const { data: session } = useSession();
  const rowData: Array<UserTableData> = users.map((user) => {
    return {
      id: user.id,
      email: user.email,
      userFlags: [user.isBanned, false],
    };
  });
  const [data, setData] = React.useState(rowData);

  const columns: Column<{ id: number; email: string; userFlags: boolean[] }>[] =
    React.useMemo(
      () => [
        { Header: "ID", accessor: "id" },
        { Header: "E-mail", accessor: "email" },
        { Header: "Actions", accessor: "userFlags" },
      ],
      []
    );
  const tableInstance = useTable({ columns, data });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  const toggleBan = async (id: number, isBanned: boolean) => {
    try {
      const user = users.find((user) => user.id === id);
      if (user) {
        updateButtonState(data, user, id, setData, true);
      }
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
        updateButtonState(data, updatedUser, id, setData, false);
      }
    } catch (e) {
      isErrorPresent = true;
    }
  };

  return (
    <SimpleLayout>
      {isErrorPresent ? (
        <div className="mb-3" style={{ color: "red" }}>
          Error while sending a request to user API
        </div>
      ) : (
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
                        {cell.column.id === "userFlags" && (
                          <BanButton
                            isBanned={row.original.userFlags[0]}
                            isLoading={row.original.userFlags[1]}
                            handleBan={() =>
                              toggleBan(
                                row.original.id,
                                row.original.userFlags[0]
                              )
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
      )}
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

  var users: Array<User> = [];
  var isErrorPresent: Boolean = false;
  try {
    users = await res.json();
  } catch (e) {
    isErrorPresent = true;
  }

  return {
    props: { users, isErrorPresent },
  };
};

const updateButtonState = (
  data: UserTableData[],
  user: Partial<User>,
  id: number,
  setData: (value: React.SetStateAction<UserTableData[]>) => void,
  isLoading: boolean
) => {
  const index = data.findIndex((user) => user.id === id);
  const email = user.email ? user.email : "";
  const isBanned = user.isBanned ? user.isBanned : false;
  const idToAssign = user.id ? user.id : 0;
  const dataToAdd = {
    id: idToAssign,
    email: email,
    userFlags: [isBanned, isLoading],
  };

  setData((prevData) => {
    const newData = [...prevData];
    newData[index] = {
      ...newData[index],
      ...dataToAdd,
    };
    return newData;
  });
};
