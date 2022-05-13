import React from "react";
import Navbar from "./Navbar";
import { Container } from "semantic-ui-react";
// import nprogress from "nprogress"
import Router from "next/router"

function Layout({ children }) {
  return (
    <>
      <Navbar />
      <Container style={{ paddingTop: "1rem" }} text>
        {children}
      </Container>
    </>
  );
}

export default Layout;
