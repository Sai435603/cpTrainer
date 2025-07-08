import "./ProblemSet.css";
import ProblemList from "./ProblemList";
import { useEffect, useState } from "react";
import Loader from "./Loader.jsx";
const baseUrl = import.meta.env.VITE_BASE_URL;

export default function ProblemSet({ handle }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchProblems() {
      const res = await fetch(`${baseUrl}/api/problems?handle=${handle}`);
      setProblems(await res.json());
      setLoading(false);
    }
    fetchProblems();
  }, [handle]);

  return (
    <>
      <section className="problem-set">
        <h2>Daily Problems</h2>
        {loading ? <Loader /> : <ProblemList problems={problems} />}
      </section>
    </>
  );
}
