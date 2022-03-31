import { useFormik } from "formik";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

toast.configure();

export default function NotificationForm() {
  const { data: session } = useSession();
  const [error, setError] = useState("");

  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
    },
    onSubmit: async (values) => {
      const isServer = typeof window === "undefined";
      const host = isServer
        ? process.env.NEXT_PUBLIC_BASE_URL
        : "/tutortek-api";

      if (values.title === "" || values.content === "") {
        setError("Please fill in all fields");
      } else {
        setError("");
        const res = await fetch(`${host}/notifications/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.accessToken}`,
          },
          body: JSON.stringify(values),
        });

        if (res.ok) {
          toast.success("Notification sent successfully", {
            position: toast.POSITION.BOTTOM_CENTER,
          });
        } else {
          toast.error("Failed to send notification", {
            position: toast.POSITION.BOTTOM_CENTER,
          });
        }
      }
    },
  });

  return (
    <div className="p-3">
      <h1 className="display-6 mb-3">Send a notification</h1>
      <form onSubmit={formik.handleSubmit}>
        <div className="mb-3">
          <input
            className="form-control"
            id="title"
            name="title"
            placeholder="Title"
            aria-describedby="titleHelp"
            onChange={formik.handleChange}
            value={formik.values.title}
          />
        </div>

        <div className="mb-3">
          <textarea
            className="form-control"
            id="content"
            name="content"
            style={{ resize: "none" }}
            placeholder="Content"
            aria-describedby="contentHelp"
            onChange={formik.handleChange}
            value={formik.values.content}
          />
        </div>

        {error && (
          <div className="mb-3" style={{ color: "red" }}>
            {error}
          </div>
        )}

        <div className="mb-3">
          <button className="btn btn-primary" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
