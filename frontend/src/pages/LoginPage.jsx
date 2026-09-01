import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router";

import api from "../services/api";

import {
  useAuth,
} from "../context/AuthContext";

import "./AuthPages.css";

function LoginPage() {
  const navigate = useNavigate();

  const { login } = useAuth();

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [showPassword, setShowPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    try {
      const response =
        await api.post(
          "/auth/login",
          {
            email,
            password,
          }
        );

      login(
        response.data.user,
        response.data.token
      );

      navigate("/");
    } catch (error) {
      console.error(error);

      setError(
        "Invalid email or password."
      );
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-header">

          <h1>
            Welcome Back
          </h1>

          <p>
            Sign in to your NexoGear account
          </p>

        </div>


        {error && (
          <p className="auth-message-error">
            {error}
          </p>
        )}


        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          <div className="auth-field">

            <label>
              Email Address
            </label>

            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              required
            />

          </div>


          <div className="auth-field">

            <label>
              Password
            </label>

            <div className="password-field-wrapper">

              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
              />

              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                title={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword ? (

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 3L21 21M10.6 10.6A2 2 0 0 0 13.4 13.4M9.9 4.24A10.8 10.8 0 0 1 12 4C17.5 4 21 9 21 12C20.57 13.19 19.9 14.31 19 15.27M6.61 6.61C4.62 7.93 3.45 9.92 3 12C4 15 7.5 20 12 20C13.43 20 14.74 19.66 15.89 19.12"
                    />
                  </svg>

                ) : (

                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 12C4 9 7.5 4 12 4C16.5 4 20 9 21 12C20 15 16.5 20 12 20C7.5 20 4 15 3 12Z"
                    />

                    <circle
                      cx="12"
                      cy="12"
                      r="2.5"
                    />
                  </svg>

                )}

              </button>

            </div>

          </div>


          <button
            className="auth-button"
            type="submit"
          >
            Sign In
          </button>

        </form>


        <div className="auth-footer">

          Don't have an account?{" "}

          <Link to="/register">
            Create Account
          </Link>

        </div>

      </div>

    </div>
  );
}

export default LoginPage;