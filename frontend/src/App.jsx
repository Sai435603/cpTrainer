import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import Body from "./components/Body";
import Contests from "./components/Contests";
import Analytics from "./components/Analytics";

function App({handle}) {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Body handle={handle}/>} />
          <Route path="contests" element={<Contests />} />
          <Route path="analytics" element={<Analytics />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
