import { useState } from "react";

import {
  Link,
  useNavigate,
} from "react-router";

import api from "../services/api";

import "./AuthPages.css";

function RegisterPage() {
  const navigate = useNavigate();

  const [formData, setFormData] =
    useState({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phone: "",
      city: "",
      street: "",
      number: "",
    });

  const [showPassword, setShowPassword] =
    useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,

      [event.target.name]:
        event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );

      return;
    }

    try {
      const registerData = {
        firstName:
          formData.firstName,

        lastName:
          formData.lastName,

        email:
          formData.email,

        password:
          formData.password,

        phone:
          formData.phone,

        city:
          formData.city,

        street:
          formData.street,

        number:
          formData.number,
      };

      await api.post(
        "/auth/register",
        registerData
      );

      navigate("/login");

    } catch (error) {
      console.error(error);

      if (
        typeof error.response?.data ===
        "string"
      ) {
        setError(
          error.response.data
        );
      } else {
        setError(
          "Registration failed. Please check your information."
        );
      }
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card register-card">

        <div className="auth-header">

          <h1>
            Create Account
          </h1>

          <p>
            Join NexoGear and start shopping
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

          <div className="auth-section-title">
            Personal Information
          </div>


          <div className="auth-row">

            <div className="auth-field">

              <label>
                First Name
              </label>

              <input
                name="firstName"
                placeholder="First name"
                value={
                  formData.firstName
                }
                onChange={handleChange}
                required
              />

            </div>


            <div className="auth-field">

              <label>
                Last Name
              </label>

              <input
                name="lastName"
                placeholder="Last name"
                value={
                  formData.lastName
                }
                onChange={handleChange}
                required
              />

            </div>

          </div>


          <div className="auth-field">

            <label>
              Email Address
            </label>

            <input
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              required
            />

          </div>


          <div className="auth-row">

            <div className="auth-field">

              <label>
                Password
              </label>

              <div className="password-field-wrapper">

                <input
                  name="password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Create a password"
                  value={
                    formData.password
                  }
                  onChange={handleChange}
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


            <div className="auth-field">

              <label>
                Confirm Password
              </label>

              <div className="password-field-wrapper">

                <input
                  name="confirmPassword"
                  type={
                    showConfirmPassword
                      ? "text"
                      : "password"
                  }
                  placeholder="Repeat your password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  title={
                    showConfirmPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showConfirmPassword ? (

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

          </div>


          <div className="auth-field">

            <label>
              Phone Number
            </label>

            <input
              name="phone"
              type="tel"
              placeholder="+359..."
              value={formData.phone}
              onChange={handleChange}
              required
            />

          </div>


          <div className="auth-section-title">
            Shipping Address
          </div>


          <div className="auth-field">

            <label>
              City
            </label>

            <input
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
            />

          </div>


          <div className="auth-row">

            <div className="auth-field">

              <label>
                Street
              </label>

              <input
                name="street"
                placeholder="Street"
                value={
                  formData.street
                }
                onChange={handleChange}
                required
              />

            </div>


            <div className="auth-field">

              <label>
                Number
              </label>

              <input
                name="number"
                placeholder="No."
                value={
                  formData.number
                }
                onChange={handleChange}
                required
              />

            </div>

          </div>


          <button
            className="auth-button"
            type="submit"
          >
            Create Account
          </button>

        </form>


        <div className="auth-footer">

          Already have an account?{" "}

          <Link to="/login">
            Sign In
          </Link>

        </div>

      </div>

    </div>
  );
}

export default RegisterPage;