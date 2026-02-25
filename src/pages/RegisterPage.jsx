import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css";
function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/api/auth/signup`,
        { username, email, password }
      );

      alert("Registered successfully!");
      navigate("/");
    } catch (err) {
      alert("Registration failed");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h1 className="title">Sign Up</h1>
        <p className="subtitle">Secure Your Quiz Account</p>

        {/* Username */}
        <div className="input-group">
          <input
            type="text"
            placeholder="Full Name"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* Email */}
        <div className="input-group">
          <input
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Password */}
        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Password Rules */}
        <div className="password-rules">
          <p>• At least 8 characters</p>
          <p>• At least one number</p>
          <p>• Uppercase & lowercase letters</p>
        </div>

        <button className="signup-btn" onClick={handleRegister}>
          Sign Up →
        </button>
      </div>
    </div>
  );
}

export default RegisterPage;