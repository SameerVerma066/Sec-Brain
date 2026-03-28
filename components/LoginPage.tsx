"use client";

import { useState } from "react";
import { auth } from "@/lib/api";

interface LoginPageProps {
  setToken: (token: string) => void;
}

export default function LoginPage({ setToken }: LoginPageProps) {
  const [isSignup, setIsSignup] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = isSignup
        ? await auth.signup(username, password)
        : await auth.signin(username, password);

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("username", username);
        setToken(response.data.token);
      } else if (isSignup && response.data.message) {
        localStorage.setItem("username", username);
        setIsSignup(false);
        setPassword("");
        setError("Signup successful! Please sign in.");
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div className="logo">🧠</div>
          <h1 className="login-title">Second Brain</h1>
        </div>

        <h2 className="login-subtitle">
          {isSignup ? "Create an Account" : "Sign In"}
        </h2>

        {error && (
          <div className="error-box">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-input"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="login-button"
          >
            {loading ? "Loading..." : isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="toggle-link"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
