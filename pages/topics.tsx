import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { AppProps } from "next/app";
import React from "react";
import { Button } from "react-bootstrap";
import { Column, usePagination, useTable } from "react-table";
import ApproveButton from "../components/buttons/approve-button";
import SimpleLayout from "../components/layout/simple";
import { Topic } from "../interfaces/topic";
import { TopicTableData } from "../interfaces/topic-table-data";

interface Props {
  topics: Topic[];
  isErrorPresent: Boolean;
}

var currentPageIndex: number = 0;

export default function Topics({ topics, isErrorPresent }: AppProps & Props) {
  const { data: session } = useSession();
  var rowData: Array<TopicTableData> = [];

  if (!isErrorPresent) {
    rowData = topics.map((topic) => {
      return {
        id: topic.id,
        name: topic.name,
        topicFlags: [topic.isApproved, false],
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
      item.name.toLowerCase().includes(keyword)
    );
    currentPageIndex = 0;
    setData(rowData);
  };

  const columns: Column<{
    id: number;
    name: string;
    topicFlags: boolean[];
  }>[] = React.useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "E-mail", accessor: "name" },
      { Header: "Actions", accessor: "topicFlags" },
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

  const handleApproval = async (id: number) => {
    try {
      const topic = topics.find((topic) => topic.id === id);
      if (topic) {
        updateButtonState(data, topic, id, setData, true);
      }
      const res = await fetch(`/tutortek-api/topics/${id}/approve`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${session?.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      const updatedTopic: Partial<Topic> = await res.json();

      if (updatedTopic?.id) {
        const newData = data.filter((item) => item.id !== updatedTopic.id);
        setData(newData);
        //updateButtonState(data, updatedTopic, id, setData, false);
      }
    } catch (e) {
      isErrorPresent = true;
    }
  };

  return (
    <SimpleLayout>
      {isErrorPresent ? (
        <div className="mb-3" style={{ color: "red" }}>
          Error while sending a request to topic API
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
                        <td key={key} {...cellProps}>
                          {cell.column.id === "topicFlags" && (
                            <ApproveButton
                              isLoading={row.original.topicFlags[1]}
                              handleApproval={() =>
                                handleApproval(row.original.id)
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
            {pageIndex + 1} of {pageOptions.length}
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

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/topics/unapproved`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.accessToken}`,
      },
    }
  );

  var topics: Array<Topic> = [];
  var isErrorPresent: Boolean = false;
  try {
    if (res.ok) {
      topics = await res.json();
    } else {
      isErrorPresent = true;
    }
  } catch (e) {
    isErrorPresent = true;
  }

  return {
    props: { topics, isErrorPresent },
  };
};

const updateButtonState = (
  data: TopicTableData[],
  topic: Partial<Topic>,
  id: number,
  setData: (value: React.SetStateAction<TopicTableData[]>) => void,
  isLoading: boolean
) => {
  const index = data.findIndex((topic) => topic.id === id);
  const name = topic.name ? topic.name : "";
  const isApproved = topic.isApproved ? topic.isApproved : false;
  const idToAssign = topic.id ? topic.id : 0;
  const dataToAdd = {
    id: idToAssign,
    name: name,
    topicFlags: [isApproved, isLoading],
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
