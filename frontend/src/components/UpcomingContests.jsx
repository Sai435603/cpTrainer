import { useEffect, useState } from "react";
import "./UpcomingContests.css";
const baseUrl = import.meta.env.VITE_BASE_URL;
export default function UpcomingContests() {
  const [upcomingContests, setUpComingContests] = useState({
    codeforcesContest: { name: "Codeforces", date: "" },
    codechefContest: { name: "CodeChef", date: "" },
    leetcodeContest: { name: "Leetcode", date: "" },
  });
  useEffect(() => {
    async function fetchUpcomingContests() {
      const res = await fetch(`${baseUrl}/api/upcomingContests`);
      const contests = await res.json();
      setUpComingContests(contests);
    }
    fetchUpcomingContests();
  }, []);
  return (
    <div className="contests">
      <h2 className="title">Upcoming Contests</h2>
      <div className="contest-list">
        <ul>
          <li>
            <img src="/images/CodeforcesLogo.png" alt="" />
            <div className="contestName">
              {" "}
              {upcomingContests.codeforcesContest.name}
            </div>
            <div className="contestDate">
              {" "}
              {upcomingContests.codeforcesContest.date}
            </div>
          </li>
          <li>
            <img src="/images/CodeChefLogo.svg" alt="" />
            <div className="contestName">
              {upcomingContests.codechefContest.name}
            </div>
            <div className="contestDate">
              {upcomingContests.codechefContest.date}
            </div>
          </li>
          <li>
            <img src="/images/leetcodeLogo.webp" alt="" />
            <div className="contestName">
              {upcomingContests.leetcodeContest.name}
            </div>
            <div className="contestDate">
              {upcomingContests.leetcodeContest.date}
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
}
