import RatingChart from "./RatingChart";
import StreakCalendar from "./StreakCalendar";
import ProblemSet from "./ProblemSet";
import "./Body.css";
import { useState } from "react";
export default function Body({ handle, values }) {
  return (
    <main className="body-container">
      <ProblemSet handle={handle} />
      <div className="sub-container">
        <RatingChart handle={handle} />
        <StreakCalendar values = {values}/>
      </div>
      {/* <UpcommingContests/> */}
    </main>
  );
}
