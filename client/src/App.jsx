import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Login from "./pages/Login";
import Admin from "./pages/Admin";
import Emp from "./pages/Emp";
import Manager from "./pages/Manager";
import HR from "./pages/HR";
import PeerReview from "./pages/PeerReview";

const MotionDiv = motion.div;

function AnimatedRoutes({ user, setUser }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route
          path="/"
          element={
            <MotionDiv
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {!user ? (
                <Login setUser={setUser} />
              ) : user.role === "admin" ? (
                <Navigate to="/admin" />
              ) : user.role === "hr" ? (
                <Navigate to="/hr" />
              ) : user.role === "manager" ? (
                <Navigate to="/manager" />
              ) : user.role === "employee" ? (
                <Navigate to="/employee" />
              ) : (
                <Navigate to="/" />
              )}
            </MotionDiv>
          }
        />

        <Route
          path="/admin"
          element={
            <MotionDiv
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {user && user.role === "admin" ? <Admin setUser={setUser} /> : <Navigate to="/" />}
            </MotionDiv>
          }
        />

        <Route
          path="/hr"
          element={
            <MotionDiv
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {user && user.role === "hr" ? <HR setUser={setUser} /> : <Navigate to="/" />}
            </MotionDiv>
          }
        />

        <Route
          path="/manager"
          element={
            <MotionDiv
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {user && user.role === "manager" ? <Manager setUser={setUser} /> : <Navigate to="/" />}
            </MotionDiv>
          }
        />

        <Route
          path="/employee"
          element={
            <MotionDiv
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {user && user.role === "employee" ? <Emp setUser={setUser} /> : <Navigate to="/" />}
            </MotionDiv>
          }
        />

        <Route
          path="/employee/peer-review"
          element={
            <MotionDiv
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.2 }}
            >
              {user && user.role === "employee" ? <PeerReview setUser={setUser} /> : <Navigate to="/" />}
            </MotionDiv>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  const [user, setUser] = useState(() => {
    try {
      const data = localStorage.getItem("user");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });

  return (
    <BrowserRouter>
      <AnimatedRoutes user={user} setUser={setUser} />
    </BrowserRouter>
  );
}

export default App;
