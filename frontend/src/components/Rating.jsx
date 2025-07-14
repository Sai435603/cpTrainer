import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./RatingChart.css";
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        style={{
          backgroundColor: "#1f1f1f",
          padding: "10px",
          border: "1px solid red",
          borderRadius: "5px",
          color: "white",
          maxWidth: 250,
        }}
      >
        <div><strong>{data.contestName}</strong></div>
        <div>Rank: {data.rank}</div>
        <div>Rating: {data.rating}</div> 
      </div>
    );
  }
  return null;
};

export default function Rating({ userRatings }) {
  const {codeforces } = userRatings;
  if (!codeforces || codeforces.length === 0) {
    return <div style={{ color: "white" }}>Loading or no rating data available</div>;
  }
  
  return (
    <div className="rating-container" style={{ width: "100%", height: 260 }}>
      <ResponsiveContainer>
        <LineChart data={codeforces}>
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="rating"
            stroke="red"
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
