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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-2xl font-bold">🧠</span>
          </div>
          <h1 className="text-2xl font-bold ml-3 text-gray-900">Second Brain</h1>
        </div>

        <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">
          {isSignup ? "Create an Account" : "Sign In"}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white font-semibold py-2 rounded-lg transition duration-200"
          >
            {loading ? "Loading..." : isSignup ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            {isSignup ? "Already have an account?" : "Don't have an account?"}
            <button
              onClick={() => {
                setIsSignup(!isSignup);
                setError("");
              }}
              className="text-purple-600 font-semibold ml-2 hover:underline"
            >
              {isSignup ? "Sign In" : "Sign Up"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
