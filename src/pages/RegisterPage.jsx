import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleRegister = async () => {
    await axios.post("http://localhost:3000/api/auth/signup", {
      username,
      email,
      password
    });

    alert("Registered successfully!");
    navigate("/");
  };

  return (
    <div className="container mt-5">
      <h2>Register</h2>

      <input className="form-control mb-2"
        placeholder="Username"
        onChange={(e) => setUsername(e.target.value)} />

      <input className="form-control mb-2"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)} />

      <input type="password"
        className="form-control mb-2"
        placeholder="Password"
        onChange={(e) => setPassword(e.target.value)} />

      <button className="btn btn-success" onClick={handleRegister}>
        Register
      </button>
    </div>
  );
}

export default RegisterPage;