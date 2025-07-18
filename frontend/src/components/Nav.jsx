import "./Nav.css";
import { FaFire } from "react-icons/fa";
import { Link } from "react-router-dom";
export default function Nav() {
  const streak = 1;
  const fireColor =
    streak >= 10
      ? "#e74c3c"
      : streak >= 7
      ? "#27ae60"
      : streak >= 3
      ? "#27ae60"
      : "#cfd8dc";
  return (
    <nav className="navbar">
      <div className="navbarlogo">CP TRAINER</div>
      <ul className="navbarlinks">
        <li>
          <Link to="/">PROBLEMS</Link>
        </li>
        <li>
          <Link to="/contests">CONTESTS</Link>
        </li>
        <li>
          <Link to="/analytics">ANALYTICS</Link>
        </li>
      </ul>
      <div className="navbarstreak">
        <FaFire className="streak-icon" style={{ color: fireColor }} />
        <span className="streak-count">{streak} days</span>
      </div>
      <button className="navbarlogin">Sync Profile</button>
    </nav>
  );
}
