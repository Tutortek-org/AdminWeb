import Head from "next/head";
import { getCsrfToken } from "next-auth/react";
import SimpleLayout from "../components/layout/simple";
import LoginForm from "../components/login/login-form";
import { GetServerSideProps } from "next/types";

interface Props {
  csrfToken: string;
}

export default function Login({ csrfToken }: Props) {
  return (
    <SimpleLayout>
      <Head>
        <title>Login Page</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="vh-100 d-flex justify-content-center align-items-center">
        <LoginForm csrfToken={csrfToken} />
      </main>
    </SimpleLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const csrfToken = await getCsrfToken(context);
  return {
    props: { csrfToken },
  };
};
