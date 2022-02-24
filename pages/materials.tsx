import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { AppProps } from "next/app";
import React from "react";
import { Button } from "react-bootstrap";
import { Column, usePagination, useTable } from "react-table";
import ApproveButton from "../components/buttons/approve-button";
import RejectButton from "../components/buttons/reject-button";
import SimpleLayout from "../components/layout/simple";
import { Material } from "../interfaces/material/material";
import { MaterialTableData } from "../interfaces/material/material-table-data";

interface Props {
  materials: Material[];
  isErrorPresent: Boolean;
}

let currentPageIndex: number = 0;

export default function Materials({
  materials,
  isErrorPresent,
}: AppProps & Props) {
  const { data: session } = useSession();
  let rowData: Array<MaterialTableData> = [];

  if (!isErrorPresent) {
    rowData = mapMaterialsToTableData(materials);
  }

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
    description: string;
    link: string;
    materialFlags: boolean[];
  }>[] = React.useMemo(
    () => [
      { Header: "ID", accessor: "id" },
      { Header: "Name", accessor: "name" },
      { Header: "Description", accessor: "description" },
      { Header: "Link", accessor: "link" },
      { Header: "Actions", accessor: "materialFlags" },
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

  const handleDecision = async (id: number, approve: boolean) => {
    try {
      const material = materials.find((material) => material.id === id);
      if (material) {
        updateButtonState(data, material, id, setData, true);
      }
      const res = await fetch(
        `/tutortek-api/materials/${id}${approve ? "/approve" : ""}`,
        {
          method: approve ? "PUT" : "DELETE",
          headers: {
            Authorization: `Bearer ${session?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!res.ok) {
        isErrorPresent = true;
        return;
      }

      const newMaterials = await fetchMaterials(session?.accessToken as string);
      if (newMaterials) {
        const newRowData = mapMaterialsToTableData(newMaterials);
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
          Error while sending a request to learning materials API
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
                          {cell.column.id === "materialFlags" && (
                            <>
                              <ApproveButton
                                isLoading={row.original.materialFlags[1]}
                                handleApproval={() =>
                                  handleDecision(row.original.id, true)
                                }
                              />
                              <RejectButton
                                isLoading={row.original.materialFlags[1]}
                                className="mx-2"
                                handleApproval={() =>
                                  handleDecision(row.original.id, false)
                                }
                              />
                            </>
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

const updateButtonState = (
  data: MaterialTableData[],
  material: Partial<Material>,
  id: number,
  setData: (value: React.SetStateAction<MaterialTableData[]>) => void,
  isLoading: boolean
) => {
  const index = data.findIndex((material) => material.id === id);
  const name = material.name ? material.name : "";
  const isApproved = material.isApproved ? material.isApproved : false;
  const idToAssign = material.id ? material.id : 0;
  const description = material.description ? material.description : "";
  const link = material.link ? material.link : "";
  const dataToAdd = {
    id: idToAssign,
    name: name,
    description: description,
    link: link,
    materialFlags: [isApproved, isLoading],
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

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);

  const materials = await fetchMaterials(session?.accessToken as string);

  if (materials) {
    return {
      props: {
        materials,
        isErrorPresent: false,
      },
    };
  }

  return {
    props: { materials: [], isErrorPresent: true },
  };
};

const mapMaterialsToTableData = (
  materials: Material[]
): MaterialTableData[] => {
  return materials.map((material) => {
    return {
      id: material.id,
      name: material.name,
      description: material.description,
      link: material.link,
      materialFlags: [material.isApproved, false],
    };
  });
};

const fetchMaterials = async (token: string): Promise<Material[] | null> => {
  const isServer = typeof window === "undefined";
  const host = isServer ? process.env.NEXT_PUBLIC_BASE_URL : "/tutortek-api";

  try {
    const res = await fetch(`${host}/materials/unapproved`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const materials: Material[] = await res.json();
      return materials;
    }
  } catch (e) {}

  return null;
};
