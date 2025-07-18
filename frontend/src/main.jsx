import { StrictMode, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import LoginSignUp from "./LoginSignUp.jsx";
function RootComponent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <StrictMode>
      {isAuthenticated ? (
        <App />
      ) : (
        <LoginSignUp setIsAuthenticated={setIsAuthenticated} />
      )}
    </StrictMode>
  );
}

createRoot(document.getElementById("root")).render(<RootComponent />);
