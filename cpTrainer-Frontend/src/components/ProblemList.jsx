import "./ProblemSet.css";

export default function ProblemList({ problems }) {
  return (
    <div className="problem-list">
      <ol>
        {problems.map((problem) => (
          <li
            key={`${problem.contestId}-${problem.index}`}
            onClick={() =>
              window.open(
                `https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`,
                "_blank"
              )
            }
          >
            {problem.name}
          </li>
        ))}
      </ol>
    </div>
  );
}
