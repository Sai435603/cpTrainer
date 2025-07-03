import "./ProblemSet.css";
import ProblemList from "./ProblemList";
import { useEffect, useState } from "react";
import Loader from "./Loader.jsx";

export default function ProblemSet({ handle }) {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    async function fetchProblems() {
      // custom pick Random function
      function pickRandom(arr, count) {
        const used = new Set();
        const selected = [];
        while (selected.length < count && used.size < arr.length) {
          const idx = Math.floor(Math.random() * arr.length);
          if (used.has(idx)) continue;
          used.add(idx);
          selected.push(arr[idx]);
        }
        return selected;
      }
      // 1. Get user rating
      const resUser = await fetch(
        `https://codeforces.com/api/user.info?handles=${handle}`
      );
      const userData = await resUser.json();
      const rating = userData.result[0].rating;
      // 2. Fetching the problems
      const problemRes = await fetch(
        "https://codeforces.com/api/problemset.problems"
      );
      const problemData = await problemRes.json();
      const allProblems = problemData.result.problems;

      // Step 3: Fetch user's submissions
      const statusRes = await fetch(
        `https://codeforces.com/api/user.status?handle=${handle}`
      );
      const statusData = await statusRes.json();

      // Step 4: Get a set of solved problems (contestId-index)
      const solvedSet = new Set();
      for (const sub of statusData.result) {
        if (sub.verdict === "OK") {
          const key = `${sub.problem.contestId}-${sub.problem.index}`;
          solvedSet.add(key);
        }
      }

      // Step 5: Filter out solved problems
      const unsolved = allProblems.filter((p) => {
        if (!p.contestId || !p.index || !p.name || !p.rating) return false;
        const key = `${p.contestId}-${p.index}`;
        return !solvedSet.has(key);
      });
      // Step 6: Filter out problems according to rating
      const buckets = [
        { offset: -200, count: 1 },
        { offset: -100, count: 2 },
        { offset: 0, count: 2 },
        { offset: 100, count: 2 },
        { offset: 200, count: 2 },
        { offset: 300, count: 1 },
      ];

      const selectedProblems = [];

      for (const bucket of buckets) {
        const target = rating + bucket.offset;
        // Use ±25 margin to allow slight rating mismatch
        const candidates = unsolved.filter(
          (p) => p.rating >= target - 25 && p.rating <= target + 25
        );
        selectedProblems.push(...pickRandom(candidates, bucket.count));
      }
      // Final Problem list
      const finalProblemList = selectedProblems.slice(0, 10); // In case some buckets are underfilled
      setProblems(finalProblemList);
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
