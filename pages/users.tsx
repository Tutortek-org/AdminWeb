import SimpleLayout from "../components/layout/simple";
import React from "react";
import { Column, useTable, usePagination } from "react-table";
import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { AppProps } from "next/dist/shared/lib/router/router";
import { User } from "../interfaces/user/user";
import BanButton from "../components/buttons/ban-button";
import { UserTableData } from "../interfaces/user/user-table-data";
import { Button } from "react-bootstrap";

interface Props {
  users: User[];
  isErrorPresent: Boolean;
}

var currentPageIndex: number = 0;

export default function Users({ users, isErrorPresent }: AppProps & Props) {
  const { data: session } = useSession();
  var rowData: Array<UserTableData> = [];

  if (!isErrorPresent) {
    rowData = users.map((user) => {
      return {
        id: user.id,
        email: user.email,
        userFlags: [user.isBanned, false],
      };
    });
  }

  const [data, setData] = React.useState(rowData);
  const [search, setSearch] = React.useState("");
  const handleSearch = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSearch(event.target.value);
    const keyword = event.target.value.toString().toLowerCase();
    rowData = rowData.filter((item) =>
      item.email.toLowerCase().includes(keyword)
    );
    currentPageIndex = 0;
    setData(rowData);
  };

  const columns: Column<{ id: number; email: string; userFlags: boolean[] }>[] =
    React.useMemo(
      () => [
        { Header: "ID", accessor: "id" },
        { Header: "E-mail", accessor: "email" },
        { Header: "Actions", accessor: "userFlags" },
      ],
      []
    );
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    prepareRow,
    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: currentPageIndex },
    },
    usePagination
  );

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
        <>
          <label
            htmlFor="search"
            className="d-flex justify-content-center align-items-center form-label"
          >
            Search by E-mail:
            <input
              id="search"
              type="text"
              onChange={handleSearch}
              className="form-control w-auto mx-2"
            />
          </label>
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
              {page.map((row, i) => {
                prepareRow(row);
                return (
                  <tr {...row.getRowProps()} key={row.getRowProps().key}>
                    {row.cells.map((cell) => {
                      const { key, ...cellProps } = cell.getCellProps();
                      return (
                        <td key={key} {...cellProps} className="align-middle">
                          {cell.column.id === "userFlags" ? (
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
                          ) : (
                            cell.render("Cell")
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}

      <div className="pagination d-flex justify-content-center align-items-center">
        <Button
          onClick={() => {
            currentPageIndex = 0;
            gotoPage(currentPageIndex);
          }}
          disabled={!canPreviousPage}
        >
          {"<<"}
        </Button>{" "}
        <Button
          onClick={() => {
            currentPageIndex--;
            gotoPage(currentPageIndex);
          }}
          disabled={!canPreviousPage}
          className="mx-2"
        >
          {"<"}
        </Button>{" "}
        <Button
          onClick={() => {
            currentPageIndex++;
            gotoPage(currentPageIndex);
          }}
          disabled={!canNextPage}
        >
          {">"}
        </Button>{" "}
        <Button
          onClick={() => {
            currentPageIndex = pageCount - 1;
            gotoPage(pageCount - 1);
          }}
          disabled={!canNextPage}
          className="mx-2"
        >
          {">>"}
        </Button>{" "}
        <span>
          Page{" "}
          <strong>
            {pageIndex + 1} of{" "}
            {pageOptions.length === 0 ? 1 : pageOptions.length}
          </strong>{" "}
          | Go to page:{" "}
        </span>
        <span className="mx-2">
          <input
            type="number"
            className="form-control"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const page = e.target.value ? Number(e.target.value) - 1 : 0;
              gotoPage(page);
            }}
            style={{ width: "100px" }}
          />
        </span>{" "}
        <select
          value={pageSize}
          className="form-select w-auto"
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[10, 20, 30, 40, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
      </div>
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
    if (res.ok) {
      users = await res.json();
    } else {
      isErrorPresent = true;
    }
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
