import React from "react";
import HeadTags from "./HeadTags";
import Navbar from "./Navbar";
import Router from "next/router"

function Layout({ children }) {
  return (
    <>
      <HeadTags />
      <Navbar />
    </>
  );
}

export default Layout;
