import "./ProblemSet.css";
export default function ProblemList({ problems }) {
  return (
    <div className="problem-list">
      <ol>
        {problems.map((problem) => (
          <a
            href={`https://codeforces.com/contest/${problem.contestId}/problem/${problem.index}`}
            target="_blank"
          >
            <li key={`${problem.contestId}-${problem.index}`}>
              {problem.name}
            </li>
          </a>
        ))}
      </ol>
    </div>
  );
}
