import type { NextPage } from "next";
import SimpleLayout from "../components/layout/simple";

const Home: NextPage = () => {
  return (
    <SimpleLayout>
      <section className="jumbotron text-center">
        <div className="container">
          <h1>Testas</h1>
          <p className="lead text-muted">Teeeeeeeeeeeeeeeeeeeestas123</p>
        </div>
      </section>

      <div className="row">
        <h1>Teeeeeeeeeeeeeeeeeeeestas</h1>
        <p>Teeeestas</p>
      </div>
    </SimpleLayout>
  );
};

export default Home;
