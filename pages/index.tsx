import { NextPage } from "next/types";
import SimpleLayout from "../components/layout/simple";

const Home: NextPage = () => {
  return (
    <SimpleLayout>
      <section className="jumbotron text-center">
        <div className="container">
          <h1>Welcome to the admin portal of Tutortek!</h1>
        </div>
      </section>

      <div className="row">
        <p>
          This site is meant for the administrators of the Tutortek mobile
          application. If you are not one of them please close this site as it
          is not meant for you. Have a great day!
        </p>
      </div>
    </SimpleLayout>
  );
};

export default Home;
