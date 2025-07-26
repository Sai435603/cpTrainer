import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import Body from "./components/Body";
import Contests from "./components/Contests";
import Analytics from "./components/Analytics";
import { useState } from "react";
import { useEffect } from "react";

function App({ handle, streak }) {
  const [values , setValues] = useState([]);
  useEffect(()=>{
     async function fetchValues(){
         const res = await fetch(`http://localhost:3000/api/streak?handle=${handle}`);
         const values = await res.json();
         setValues(values);
     }
     fetchValues();
  },[]);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout streak={streak}/>}>
          <Route index element={<Body handle={handle} values={values} />} />
          <Route path="contests" element={<Contests />} />
          <Route path="analytics" element={<Analytics handle = {handle}/>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
