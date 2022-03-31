import SimpleLayout from "../components/layout/simple";
import NotificationForm from "../components/notifications/notification-form";

export default function Write() {
  return (
    <SimpleLayout>
      <main className="vh-100 d-flex justify-content-center align-items-center">
        <NotificationForm />
      </main>
    </SimpleLayout>
  );
}
