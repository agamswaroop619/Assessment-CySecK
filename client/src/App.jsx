import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/login";
import Admin from "./pages/Admin";
import Emp from "./pages/Emp";
import Manager from "./pages/Manager";
import HR from "./pages/HR";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const data = localStorage.getItem("user");
      if (data) setUser(JSON.parse(data));
    } catch {
      setUser(null);
    }
  }, []);

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/"
          element={
            !user ? <Login setUser={setUser} /> :
              user.role === "admin"
                ? <Navigate to="/admin" />
                : user.role === "hr"
                  ? <Navigate to="/hr" />
                  : user.role === "manager"
                    ? <Navigate to="/manager" />
                    : user.role === "employee"
                      ? <Navigate to="/employee" />
                      : <Navigate to="/" />
          }
        />

        <Route
          path="/admin"
          element={
            user && user.role === "admin"
              ? <Admin setUser={setUser} />
              : <Navigate to="/" />
          }
        />

        <Route
          path="/hr"
          element={
            user && user.role === "hr"
              ? <HR setUser={setUser} />
              : <Navigate to="/" />
          }
        />

        <Route
          path="/manager"
          element={
            user && user.role === "manager"
              ? <Manager setUser={setUser} />
              : <Navigate to="/" />
          }
        />

        <Route
          path="/employee"
          element={
            user && user.role === "employee"
              ? <Emp setUser={setUser} />
              : <Navigate to="/" />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;