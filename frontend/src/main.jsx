import { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import LoginSignUp from "./LoginSignUp.jsx";
function RootComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [handle, setHandle] = useState("");
  const [userStreak, setUserStreak] = useState(0);
  return (
    <div>
      {isAuthenticated ? (
        <App handle={handle} streak={userStreak} />
      ) : (
        <LoginSignUp
          setIsAuthenticated={setIsAuthenticated}
          setHandle={setHandle}
          setUserStreak={setUserStreak}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<RootComponent />);
