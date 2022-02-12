import { Formik, Field, Form, FormikHelpers } from "formik";
import styles from "./login-form.module.css";

interface Values {
  email: string;
  password: string;
}

export default function LoginForm() {
  return (
    <div className={styles.login_box + " p-3"}>
      <h1 className="display-6 mb-3">Login</h1>
      <Formik
        initialValues={{
          email: "",
          password: "",
        }}
        onSubmit={(
          values: Values,
          { setSubmitting }: FormikHelpers<Values>
        ) => {
          setTimeout(() => {
            sendLoginRequest(values);
            setSubmitting(false);
          }, 500);
        }}
      >
        <Form>
          <div className="mb-3">
            <Field
              className="form-control"
              id="email"
              name="email"
              placeholder="E-mail"
              aria-describedby="usernameHelp"
            />
          </div>

          <div className="mb-3">
            <Field
              className="form-control"
              id="password"
              name="password"
              placeholder="Password"
              type="password"
            />
          </div>

          <button type="submit" className="btn btn-primary">
            Login
          </button>
        </Form>
      </Formik>
    </div>
  );
}

const sendLoginRequest = async (values: Values) => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/login`, {
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(values),
  });
  const data = await response.json();
  console.log(data.token);
};
