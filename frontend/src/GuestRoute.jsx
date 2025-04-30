// GuestRoute.jsx
import { Navigate } from "react-router-dom";

function GuestRoute({ children }) {
  // Check for the token in local storage
  const token = localStorage.getItem("access");

  // If token exists, redirect to the homepage; otherwise, render children
  return token ? <Navigate to="/home" /> : children;
}

export default GuestRoute;