import Navbar from "../navbar/navbar";
import React from "react";

const SimpleLayout: React.FC = (props) => {
  return (
    <>
      <Navbar />
      <main role="main">
        <div className="album py-5 bg-light">
          <div className="container">{props.children}</div>
        </div>
      </main>
    </>
  );
};

export default SimpleLayout;
