import React from "react";
import Nav from "./Nav";
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="main-container">
      <Nav />
      <Outlet />
    </div>
  );
};

export default Layout;
