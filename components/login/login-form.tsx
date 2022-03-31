import { useFormik } from "formik";
import { signIn } from "next-auth/react";
import { useRouter } from "next/dist/client/router";
import { useState } from "react";
import styles from "./login-form.module.css";

interface Props {
  csrfToken: string;
}

export default function LoginForm({ csrfToken }: Props) {
  const [error, setError] = useState("");
  const router = useRouter();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      csrfToken,
    },
    onSubmit: async (values) => {
      const response = await signIn<"credentials">("credentials", {
        redirect: false,
        ...values,
      });

      if (response?.error) {
        setError("Invalid email or password");
        return;
      }

      router.push("/");
    },
  });

  return (
    <div className={styles.login_box + " p-3"}>
      <h1 className="display-6 mb-3">Login</h1>
      <form onSubmit={formik.handleSubmit}>
        <input name="csrfToken" type="hidden" defaultValue={csrfToken} />

        <div className="mb-3">
          <input
            className="form-control"
            id="email"
            name="email"
            placeholder="E-mail"
            aria-describedby="usernameHelp"
            onChange={formik.handleChange}
            value={formik.values.email}
          />
        </div>

        <div className="mb-3">
          <input
            className="form-control"
            id="password"
            name="password"
            placeholder="Password"
            type="password"
            onChange={formik.handleChange}
            value={formik.values.password}
          />
        </div>

        {error && (
          <div className="mb-3" style={{ color: "red" }}>
            {error}
          </div>
        )}

        <button type="submit" className="btn btn-primary">
          Login
        </button>
      </form>
    </div>
  );
}
