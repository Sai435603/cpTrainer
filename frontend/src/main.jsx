import { useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import LoginSignUp from "./LoginSignUp.jsx";
function RootComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [handle, setHandle] = useState("");
  return (
    <div>
      {isAuthenticated ? (
        <App handle={handle} />
      ) : (
        <LoginSignUp
          setIsAuthenticated={setIsAuthenticated}
          setHandle={setHandle}
        />
      )}
    </div>
  );
}

createRoot(document.getElementById("root")).render(<RootComponent />);
