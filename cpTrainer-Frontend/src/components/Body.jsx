import RatingChart from "./RatingChart";
import StreakCalendar from "./StreakCalendar";
import ProblemSet from "./ProblemSet";
import "./Body.css";
import { useState } from "react";
export default function Body() {
  const handle = "-200";
  return (
    <main className="body-container">
      <ProblemSet handle={handle} />
      <div className="sub-container">
        <RatingChart handle={handle} />
        <StreakCalendar />
      </div>
    </main>
  );
}
