import React, { useState } from "react";
import "./LoginSignup.css";

export default function LoginSignup({ setIsAuthenticated }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [questionUrl, setQuestionUrl] = useState(null);

  const handleChange = (e) => {
    setUsername(e.target.value);
    setError("");
    setQuestionUrl(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setQuestionUrl(null);

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username , questionUrl}),
      });

      if (response.status === 401) {
        const data = await response.json();
        if (data.questionUrl) {
          setQuestionUrl(data.questionUrl);
        } else {
          setError(data.message || "Challenge required");
        }
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        setError(data.message || "Login failed");
        return;
      }

      const data = await response.json();
      console.log("Login successful:", data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("Fetch error:", err);
      setError("Network error — please try again later.");
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-logo">CP TRAINER</h1>

      <div className="login-card">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              placeholder="Provide your Codeforces handle here"
              required
              value={username}
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="login-button">Login</button>
        </form>
       
      </div>
      {questionUrl && (
        <strong className="challenge-text">
          You need to make a wrong submission on this problem within 5 minutes: <u>
          <a href={questionUrl} target="_blank" rel="noopener noreferrer">{questionUrl}</a>
          </u>
        </strong>
      )}
    </div>
  );
}
