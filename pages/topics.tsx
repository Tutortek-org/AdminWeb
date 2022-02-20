import { GetServerSideProps } from "next";
import { getSession } from "next-auth/react";
import SimpleLayout from "../components/layout/simple";
import { Topic } from "../interfaces/topic";

export default function Topics() {
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
      console.log(topics);
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
