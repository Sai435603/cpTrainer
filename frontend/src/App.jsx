import Nav from "./components/Nav";
import Body from "./components/Body";
import Footer from "./components/Footer";
import "./App.css";
import { useEffect } from "react";
// import { useEffect, useState } from "react";
function App() {
  // const [problems, setProblems] = useState([]);
  // useEffect(() => {
  //   async function fetchTenRandomCfProblems() {
  //     const response = await fetch(
  //       "https://codeforces.com/api/problemset.problems"
  //     );
  //     const userDataResponse = await fetch(
  //       "https://codeforces.com/api/user.info?handles=tourist"
  //     );
  //     const userData = await userDataResponse.json();
  //     console.log(userData);
  //     const data = await response.json();
  //     const problemList = data.result.problems;
  //     const firstTen = problemList.slice(0, 10);
  //     setProblems(firstTen);
  //   }
  //   fetchTenRandomCfProblems();
  // }, []);
  return (
    <div className="main-container">
      <Nav />
      <Body />
      <Footer />
    </div>
  );
}
export default App;
