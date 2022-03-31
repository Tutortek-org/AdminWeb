import { useFormik } from "formik";

export default function NotificationForm() {
  const formik = useFormik({
    initialValues: {
      title: "",
      content: "",
    },
    onSubmit: async (values) => {
      console.log(values);
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

        <div className="mb-3">
          <button className="btn btn-primary" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
