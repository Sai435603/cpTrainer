import { useEffect, useState } from "react";
import "./UpcomingContests.css";

const baseUrl = import.meta.env.VITE_BASE_URL;

const logoMap = {
  Codeforces: "/images/CodeforcesLogo.png",
  CodeChef:    "/images/CodeChefLogo.svg",
  AtCoder:     "/images/AtCoderLogo.png",
  LeetCode:    "/images/leetcodeLogo.webp",
  // add more platforms here if you like
};

export default function UpcomingContests() {
  const [contests, setContests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUpcomingContests() {
      try {
        const res = await fetch(`${baseUrl}/api/upcomingContests`);
        const data = await res.json();
        const arr = Array.isArray(data)
          ? data
          : // if it's an object with keys, take the values:
            Object.values(data);
        console.log(arr);
        setContests(arr);
      } catch (err) {
        console.error("Failed to load contests:", err);
        setContests([]); // fallback to empty
      } finally {
        setLoading(false);
      }
    }
    fetchUpcomingContests();
  }, []);

  if (loading) {
    return <div className="contests">Loading contests…</div>;
  }

  if (!contests.length) {
    return <div className="contests">No contests found.</div>;
  }

  return (
    <div className="contests">
      <h2 className="title">Upcoming Contests</h2>
      <ul className="contest-list">
        {contests.map((c) => (
          <li key={`${c.platform}-${c.name}`} className="contest-item">
            <img
              className="contest-logo"
              src={logoMap[c.platform] || "/images/defaultLogo.png"}
              alt={`${c.platform} logo`}
            />
            <div className="contest-details">
              <div className="contest-name">{c.name}</div>
              <div className="contest-date">
                {new Date(c.start).toLocaleString()}
              </div>
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="contest-link"
              >
                View on {c.platform}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
