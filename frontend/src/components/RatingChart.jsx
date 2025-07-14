import Rating from "./Rating";
import "./RatingChart.css";
import Loader from "./Loader";
import { useEffect, useState } from "react";
const baseUrl = import.meta.env.VITE_BASE_URL;

export default function RatingChart({ handle }) {
  const [loaderForRating, setloaderForRating] = useState(true);
  const [userRatings, setUserRatings] = useState({ codeforces: [] });
  useEffect(() => {
    async function fetchRatings() {
      const res = await fetch(`${baseUrl}/api/ratingGraph?handle=${handle}`);
      const ratings = await res.json();
      // console.log(ratings);
      setUserRatings({ ...userRatings, codeforces: ratings });
      setloaderForRating(false);
    }
    fetchRatings();
  }, []);
  return (
    <section className="rating-chart">
      <div>
        <h2>Rating</h2>
      </div>
      {loaderForRating ? <Loader /> : <Rating userRatings={userRatings} />}
    </section>
  );
}
