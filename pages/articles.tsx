import SimpleLayout from "../components/layout/simple";
import React from "react";
import { Column, useTable } from "react-table";

export default function Articles() {
  const data = React.useMemo(
    () => [
      {
        col1: "Hello",
        col2: "World",
      },
      {
        col1: "react-table",
        col2: "rocks",
      },
      {
        col1: "whatever",
        col2: "you want",
      },
    ],
    []
  );

  const columns: Column<{ col1: string; col2: string }>[] = React.useMemo(
    () => [
      { Header: "Column 1", accessor: "col1" },
      { Header: "Column 2", accessor: "col2" },
    ],
    []
  );

  const tableInstance = useTable({ columns, data });
  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    tableInstance;

  return (
    <SimpleLayout>
      <table {...getTableProps()}>
        <thead>
          {
            // Loop over the header rows

            headerGroups.map((headerGroup) => (
              // Apply the header row props

              <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
                {
                  // Loop over the headers in each row

                  headerGroup.headers.map((column) => (
                    // Apply the header cell props

                    <th {...column.getHeaderProps()} key={headerGroup.id}>
                      {
                        // Render the header

                        column.render("Header")
                      }
                    </th>
                  ))
                }
              </tr>
            ))
          }
        </thead>

        {/* Apply the table body props */}

        <tbody {...getTableBodyProps()}>
          {
            // Loop over the table rows

            rows.map((row) => {
              // Prepare the row for display

              prepareRow(row);

              return (
                // Apply the row props

                <tr {...row.getRowProps()} key={row.id}>
                  {
                    // Loop over the rows cells

                    row.cells.map((cell) => {
                      // Apply the cell props

                      return (
                        <td {...cell.getCellProps()} key={cell.column.id}>
                          {
                            // Render the cell contents

                            cell.render("Cell")
                          }
                        </td>
                      );
                    })
                  }
                </tr>
              );
            })
          }
        </tbody>
      </table>
    </SimpleLayout>
  );
}
