import Rating from "./Rating";
import "./RatingChart.css";
import Loader from "./Loader";
import { useEffect, useState } from "react";
export default function RatingChart({ handle }) {
  const [loaderForRating, setloaderForRating] = useState(true);
  const [userRatings, setUserRatings] = useState({codeforces:[], codechef:[]});
  useEffect(() => {
    async function fetchRatings() {
      const ratings = await fetch(
        `https://codeforces.com/api/user.rating?handle=${handle}`
      );
      const rating = await ratings.json();
      const formatted = rating.result.map((d) => ({
        date: new Date(d.ratingUpdateTimeSeconds * 1000).toLocaleDateString(
          "en-US",
          {
            month: "short",
            year: "numeric",
          }
        ),
        contestId: d.contestId,
        contestName: d.contestName,
        handle: d.handle,
        rating: d.newRating,
        rank: d.rank,
      }));
      setUserRatings(...userRatings, {codeforces : formatted});

      // Fetching the codeforces ratings
      const res = await fetch(`https://www.codechef.com/users/${username}`);
      const html = await res.text();
      const match = html.match(/"date_versus_rating"\s*:\s*({[^}]*})/s);
      const jsonString = `{${match[1]}}`;
      const ratingObj = await JSON.parse(jsonString);
      const ccratings =  ratingObj.all;
      setUserRatings(...userRatings, {codechef : ccratings});

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
