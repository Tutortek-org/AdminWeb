import { getSession } from "next-auth/react";
import AppProps from "next/app";
import { GetServerSideProps } from "next/types";
import SimpleLayout from "../components/layout/simple";
import { Statistics } from "../interfaces/statistics/statistics";

interface Props {
  statistics: Statistics;
}

export default function StatisticsPage({ statistics }: AppProps & Props) {
  return (
    <SimpleLayout>
      <main className="vh-100 d-flex justify-content-center align-items-center">
        {
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Application statistics</h5>
              <p className="card-text">
                <strong>Total number of topics:</strong> {statistics.topicCount}
              </p>
              <p className="card-text">
                <strong>Total number of users:</strong> {statistics.userCount}
              </p>
              <p className="card-text">
                <strong>API uptime:</strong>{" "}
                {millisecondsToTime(statistics.systemUpTime)}
              </p>
            </div>
          </div>
        }
      </main>
    </SimpleLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getSession(context);
  const statistics = await fetchStatistics(session?.accessToken as string);

  if (statistics) {
    return {
      props: {
        statistics,
      },
    };
  }

  return {
    props: {
      statistics: {},
    },
  };
};

const millisecondsToTime = (milliseconds: number): String => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  console.log(milliseconds);

  return (
    hours.toString() +
    (minutes % 60 < 10 ? ":0" : ":") +
    (minutes % 60).toString() +
    (seconds % 60 < 10 ? ":0" : ":") +
    (seconds % 60).toString()
  );
};

const fetchStatistics = async (token: string): Promise<Statistics | null> => {
  const isServer = typeof window === "undefined";
  const host = isServer ? process.env.NEXT_PUBLIC_BASE_URL : "/tutortek-api";

  try {
    const res = await fetch(`${host}/statistics`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const statistics: Statistics = await res.json();
      return statistics;
    }
  } catch (e) {}

  return null;
};
