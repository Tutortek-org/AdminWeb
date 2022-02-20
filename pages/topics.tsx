import { GetServerSideProps } from "next";
import { getSession, useSession } from "next-auth/react";
import { AppProps } from "next/app";
import React from "react";
import { Column, usePagination, useTable } from "react-table";
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
        updateButtonState(data, updatedTopic, id, setData, false);
      }
    } catch (e) {
      isErrorPresent = true;
    }
  };

  return (
    <SimpleLayout>
      <div className="row">Write Form</div>
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
