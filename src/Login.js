import React, { useContext, useState } from "react";
import { UserContext } from "./Context/UserContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import API_ENDPOINTS from "./apiconfig";
import { Icon } from "@iconify/react";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleLogin = (e) => {
    e.preventDefault();

    const fetchData = async () => {
        try {
        const response = await fetch(`${API_ENDPOINTS.getCoachProfile}/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userName: email, passWord: password }),
        });

          if (!response.ok) {
          if (response.status === 401) {
            setError("Invalid credentials. Please try again.");
          } else {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
          return;
        }

        const data = await response.json();

        if (data.success) {
          // Log in the user and navigate to the home page
          login({ name: data.coach.name, id: data.coach.id });
          navigate("/app"); 
        } else {
          setError("Invalid credentials. Please try again.");
        }
        } catch (error) {
        console.error("Error during login:", error);
        setError("An unexpected error occurred. Please try again later.");
        }
      };

    fetchData();
  };

  return (
    <div className="main-container">
      <div className="content-body">
      <div className="Header"> 
      <h1>Login</h1>
        </div>
        <div className="Footer">
          <form onSubmit={handleLogin}>
            <div>
              <input
                type="text"
                placeholder="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <span style={{ color: "red" }}>{error}</span>}
            <button className="default" type="submit">
              Login
            </button>
          </form>
          </div>
      </div>
    </div>
  );
}

export default Login;