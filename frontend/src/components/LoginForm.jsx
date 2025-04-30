import { useState, useEffect } from "react";
import api from "../api";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FaUser,
  FaEye,
  FaEyeSlash,
  FaLock,
  FaExclamationCircle,
} from "react-icons/fa";
import { AiOutlineGoogle } from "react-icons/ai";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/L_Form.css";
import axios from "axios";
import { motion } from "framer-motion";
import LoadingIndicator from "./LoadingIndicator";

function L_Form({ route, redirectTo }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorType, setErrorType] = useState(null); // "username", "password", or "server"
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const message = location.state?.message;
  const name = "Login";

  // Clear errors when inputs change
  useEffect(() => {
    if (errorType === "username") setErrorType(null);
    setErrorMessage("");
  }, [username]);

  useEffect(() => {
    if (errorType === "password") setErrorType(null);
    setErrorMessage("");
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorType(null);
    setErrorMessage(""); // Clear previous error

    try {
      const res = await api.post(route, { username, password });
      localStorage.setItem(ACCESS_TOKEN, res.data.access);
      localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${res.data.access}`;

      const response = await axios.get(
        `http://localhost:8000/api/userProfiles/${username}/`
      );
      localStorage.setItem("userProfile", JSON.stringify(response.data));

      // Success animation before redirect
      await new Promise((resolve) => setTimeout(resolve, 600));

      if (response.data.is_venue_owner) {
        navigate("/venue");
      } else {
        navigate("/home");
      }
    } catch (err) {
      console.error("Login error:", err);
      const serverError = err.response?.data?.error || "";

      // Set specific error messages with type
      if (
        serverError.toLowerCase().includes("username") ||
        err.response?.status === 404
      ) {
        setErrorType("username");
        setErrorMessage("Username not found. Please check and try again.");
      } else if (
        serverError.toLowerCase().includes("password") ||
        err.response?.status === 401
      ) {
        setErrorType("password");
        setErrorMessage("Incorrect password. Please try again.");
      } else if (err.response?.status === 429) {
        setErrorType("server");
        setErrorMessage("Too many login attempts. Please try again later.");
      } else if (!err.response) {
        setErrorType("server");
        setErrorMessage(
          "Connection error. Please check your internet connection."
        );
      } else {
        setErrorType("server");
        setErrorMessage(serverError || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Framer Motion variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 },
  };

  return (
    <div className="auth-container">
      <motion.div
        className="auth-left"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.div
          className="auth-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2>EventSpace</h2>
        </motion.div>

        <div className="auth-background-elements">
          <motion.div
            className="floating-element event-icon-1"
            animate={{
              y: [0, -15, 0],
              rotate: [0, 5, 0],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              repeatType: "reverse",
            }}
          />
          <motion.div
            className="floating-element event-icon-2"
            animate={{
              y: [0, 20, 0],
              rotate: [0, -8, 0],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 1,
            }}
          />
          <motion.div
            className="floating-element event-icon-3"
            animate={{
              y: [0, 15, 0],
              x: [0, 15, 0],
              rotate: [0, 10, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              repeatType: "reverse",
              delay: 0.5,
            }}
          />
        </div>

        <motion.div
          className="auth-welcome"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
        >
          <h1>Welcome to EventSpace</h1>
          <p>
            Effortlessly book the perfect venue for every occasion and create
            unforgettable memories!
          </p>
        </motion.div>
      </motion.div>

      <div className="auth-right">
        <motion.div
          className="auth-form-container"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {message && (
            <motion.div
              className="auth-message"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              ⚠️ {message}
            </motion.div>
          )}

          <motion.h2 variants={itemVariants}>{name} your Account</motion.h2>
          <motion.p className="auth-subtitle" variants={itemVariants}>
            It's quick and easy.
          </motion.p>

          <form onSubmit={handleSubmit} className="auth-form">
            <motion.div
              className={`form-groups ${
                errorType === "username" ? "form-error" : ""
              }`}
              variants={itemVariants}
            >
              <div className="input-groups">
                <FaUser className="input-icons" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className={errorType === "username" ? "input-error" : ""}
                  required
                />
              </div>
              {errorType === "username" && (
                <motion.div
                  className="field-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <FaExclamationCircle className="error-icon" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </motion.div>

            <motion.div
              className={`form-groups ${
                errorType === "password" ? "form-error" : ""
              }`}
              variants={itemVariants}
            >
              <div className="input-groups">
                <FaLock className="input-icons" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={errorType === "password" ? "input-error" : ""}
                  required
                />
                <div
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
              {errorType === "password" && (
                <motion.div
                  className="field-error"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                >
                  <FaExclamationCircle className="error-icon" />
                  <span>{errorMessage}</span>
                </motion.div>
              )}
            </motion.div>

            {errorType === "server" && (
              <motion.div
                className="server-error"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <FaExclamationCircle className="error-icon" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            <motion.div variants={itemVariants}>
              {loading ? (
                <LoadingIndicator />
              ) : (
                <motion.button
                  type="submit"
                  className="auth-button"
                  disabled={loading}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  {name}
                </motion.button>
              )}
            </motion.div>
          </form>

          <motion.p className="auth-switch" variants={itemVariants}>
            Don't have an account?{" "}
            <Link to="/register" className="switch-link">
              Sign Up
            </Link>
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
}

export default L_Form;
