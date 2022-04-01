import { getSession, useSession } from "next-auth/react";
import AppProps from "next/app";
import { GetServerSideProps } from "next/types";
import React from "react";
import { Button } from "react-bootstrap";
import { Column, usePagination, useTable } from "react-table";
import ResolveButton from "../components/buttons/resolve-button";
import SimpleLayout from "../components/layout/simple";
import BugReportModal from "../components/modals/bug_report_modal";
import { BugReport } from "../interfaces/bug_report/bug-report";
import { BugReportTableData } from "../interfaces/bug_report/bug-report-table-data";

interface Props {
  bugReports: BugReport[];
  isErrorPresent: Boolean;
}

let currentPageIndex: number = 0;

export default function BugReports({
  bugReports,
  isErrorPresent,
}: AppProps & Props) {
  const { data: session } = useSession();
  let rowData: Array<BugReportTableData> = [];

  if (!isErrorPresent) {
    rowData = mapBugReportsToTableData(bugReports);
  }

  const [modalShow, setModalShow] = React.useState(false);
  const [selectedBugReport, setSelectedBugReport] = React.useState<BugReport>();
  const [originalData, setOriginalData] = React.useState(rowData);
  const [data, setData] = React.useState(rowData);
  const [search, setSearch] = React.useState("");

  const handleSearch = (event: {
    target: { value: React.SetStateAction<string> };
  }) => {
    setSearch(event.target.value);
    const keyword = event.target.value.toString().toLowerCase();
    const newData = originalData.filter((item) =>
      item.name.toLowerCase().includes(keyword)
    );
    currentPageIndex = 0;
    setData(newData);
  };

  const columns: Column<{
    id: number;
    name: string;
    isLoading: boolean;
  }>[] = React.useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Name", accessor: "name" },
      { Header: "Actions", accessor: "isLoading" },
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

  const handleResolution = async (id: number) => {
    try {
      const bugReport = bugReports.find(
        (bugReport: BugReport) => bugReport.id === id
      );
      if (bugReport) {
        updateButtonState(data, bugReport, id, setData, true);
      }
      const res = await fetch(`/tutortek-api/bugreports/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        isErrorPresent = true;
        return;
      }

      const newBugReports = await fetchBugReports(
        session?.accessToken as string
      );
      if (newBugReports) {
        const newRowData = mapBugReportsToTableData(newBugReports);
        setData(newRowData);
        setOriginalData(newRowData);
      }
    } catch (e) {
      isErrorPresent = true;
    }
  };

  return (
    <SimpleLayout>
      {isErrorPresent ? (
        <div className="mb-3" style={{ color: "red" }}>
          Error while sending a request to bug report API
        </div>
      ) : (
        <>
          {" "}
          <label
            htmlFor="search"
            className="d-flex justify-content-center align-items-center form-label"
          >
            Search by name:
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
                          {cell.column.id === "isLoading" ? (
                            <>
                              <ResolveButton
                                isLoading={row.original.isLoading}
                                handleResolution={() =>
                                  handleResolution(row.original.id)
                                }
                              />
                              <Button
                                className="mx-2"
                                onClick={() => {
                                  const index = bugReports.findIndex(
                                    (bugReport) =>
                                      bugReport.id === row.original.id
                                  );
                                  setModalShow(true);
                                  setSelectedBugReport(bugReports[index]);
                                }}
                              >
                                More info
                              </Button>
                            </>
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
          <BugReportModal
            show={modalShow}
            onHide={() => setModalShow(false)}
            bugReport={selectedBugReport}
          />
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

  const bugReports = await fetchBugReports(session?.accessToken as string);

  if (bugReports) {
    return {
      props: {
        bugReports,
        isErrorPresent: false,
      },
    };
  }

  return {
    props: { bugReports: [], isErrorPresent: true },
  };
};

const fetchBugReports = async (token: string): Promise<BugReport[] | null> => {
  const isServer = typeof window === "undefined";
  const host = isServer ? process.env.NEXT_PUBLIC_BASE_URL : "/tutortek-api";

  try {
    const res = await fetch(`${host}/bugreports`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const bugReports: BugReport[] = await res.json();
      return bugReports;
    }
  } catch (e) {}

  return null;
};

const updateButtonState = (
  data: BugReportTableData[],
  bugReport: Partial<BugReport>,
  id: number,
  setData: (value: React.SetStateAction<BugReportTableData[]>) => void,
  isLoading: boolean
) => {
  const index = data.findIndex((bugReport) => bugReport.id === id);
  const name = bugReport.name ? bugReport.name : "";
  const idToAssign = bugReport.id ? bugReport.id : 0;
  const dataToAdd = {
    id: idToAssign,
    name: name,
    isLoading: isLoading,
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

const mapBugReportsToTableData = (
  bugReports: BugReport[]
): BugReportTableData[] => {
  return bugReports.map((bugReport) => {
    return {
      id: bugReport.id,
      name: bugReport.name,
      isLoading: false,
    };
  });
};
