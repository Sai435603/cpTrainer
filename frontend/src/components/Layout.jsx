import React from "react";
import Nav from "./Nav";
import { Outlet } from "react-router-dom";

const Layout = ({streak}) => {
  return (
    <div className="main-container">
      <Nav streak={streak}/>
      <Outlet />
    </div>
  );
};

export default Layout;
