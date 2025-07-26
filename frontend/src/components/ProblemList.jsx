import "./ProblemSet.css";

export default function ProblemList({ problems }) {
  console.log(problems);
  return (
    <div className="problem-list">
      <ol>
        {problems.map((prob) => (
          <li 
            key={`${prob.problem.contestId}-${prob.problem.index}`}
            className={prob.issolved ? "solved" : ""}
            onClick={() =>
              window.open(
                `https://codeforces.com/contest/${prob.problem.contestId}/problem/${prob.problem.index}`,
                "_blank"
              )
            }
          >
            {prob.problem.name} 
          </li>
        ))}
      </ol>
    </div>
  );
}
