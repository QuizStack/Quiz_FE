import { useState } from "react";
import axios from "axios";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../redux/authSlice";
import { useNavigate, Link } from "react-router-dom";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogin = async () => {
    const res = await axios.post(
      `${process.env.REACT_APP_API_URL}/api/auth/login`,
      { email, password }
    );

    dispatch(loginSuccess(res.data));
    navigate("/quizzes");
  };

  return (
    <div
      style={{
        height: "100vh",
        backgroundColor: "#f8f9fa",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div
        style={{
          width: "360px",
          padding: "32px",
          borderRadius: "16px",
          backgroundColor: "white",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)",
          border: "1px solid #e5e7eb",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            marginBottom: "24px",
            fontSize: "24px",
            fontWeight: "600",
            color: "#1a1a1a",
          }}
        >
          Login
        </h2>

        {/* Username Field */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            style={{
              width: "100%",
              height: "42px",
              padding: "0 12px",
              fontSize: "15px",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0d6efd")}
            onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
          />
        </div>

        {/* Password Field */}
        <div style={{ marginBottom: "24px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "500",
              color: "#374151",
            }}
          >
            Password
          </label>
          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="•••"
              style={{
                width: "100%",
                height: "42px",
                padding: "0 40px 0 12px",
                fontSize: "15px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#0d6efd")}
              onBlur={(e) => (e.target.style.borderColor = "#d1d5db")}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "18px",
                color: "#6c757d",
                userSelect: "none",
              }}
            >
              {showPassword ? "👁️" : "👁️"}
            </span>
          </div>
        </div>

        {/* Login Button */}
        <button
          onClick={handleLogin}
          style={{
            width: "100%",
            height: "42px",
            backgroundColor: "#0d6efd",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "16px",
            fontWeight: "500",
            cursor: "pointer",
            transition: "background-color 0.15s",
            marginBottom: "16px",
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = "#0b5ed7")}
          onMouseLeave={(e) => (e.target.style.backgroundColor = "#0d6efd")}
        >
          Login
        </button>

        {/* Register Link */}
        <p
          style={{
            textAlign: "center",
            margin: 0,
            fontSize: "15px",
            color: "#4b5563",
          }}
        >
          <Link
            to="/register"
            style={{
              color: "#0d6efd",
              textDecoration: "none",
              fontWeight: "500",
            }}
            onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
            onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
          >
            Don't have an account? Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;