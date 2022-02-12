import Head from "next/head";
import SimpleLayout from "../components/layout/simple";
import LoginForm from "../components/login/login-form";

export default function Login() {
  return (
    <SimpleLayout>
      <Head>
        <title>Login Page</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="vh-100 d-flex justify-content-center align-items-center">
        <LoginForm />
      </main>
    </SimpleLayout>
  );
}
