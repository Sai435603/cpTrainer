import React from "react";
import CalendarHeatmap from "react-calendar-heatmap";
import { Tooltip as ReactTooltip } from "react-tooltip"; // ✅ FIXED
import "react-calendar-heatmap/dist/styles.css";
import "react-tooltip/dist/react-tooltip.css";
import "./StreakCalendar.css";

const today = new Date();

// function generateDummyData(days = 365) {
//   const data = [];
//   for (let i = 0; i < days; i++) {
//     const date = new Date();
//     date.setDate(today.getDate() - i);
//     const count = Math.floor(Math.random() * 5);
//     data.push({ date: date.toISOString().split("T")[0], count });
//   }
//   return data.reverse();
// }

export default function StreakHeatmap() {
  const values = [];
  return (
    <div className="heatmap-wrapper">
      <h2 className="title">Heatmap</h2>
      <CalendarHeatmap
        startDate={new Date(new Date().setFullYear(today.getFullYear() - 1))}
        endDate={today}
        values={values}
        classForValue={(value) => {
          if (!value) return "color-empty";
          if (value.count === 1) return "color-scale-1";
          if (value.count === 2) return "color-scale-2";
          if (value.count === 3) return "color-scale-3";
          if (value.count >= 4) return "color-scale-4";
          return "color-empty";
        }}
        tooltipDataAttrs={(value) => {
          if (!value || !value.date) return null;
          return {
            "data-tooltip-id": "heatmap-tooltip",
            "data-tooltip-content": `${value.count} problems solved on ${value.date}`,
          };
        }}
        showWeekdayLabels={true}
      />
      <ReactTooltip id="heatmap-tooltip" />
    </div>
  );
}
