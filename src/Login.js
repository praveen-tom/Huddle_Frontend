import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import API_ENDPOINTS from "./apiconfig";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate(); // Initialize navigate

  const handleLogin = (e) => {
    e.preventDefault();
      const fetchData = async()=>{
        
        try {
          const response = await fetch(API_ENDPOINTS.getCoachProfile);
          console.log(response);
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log("data",data); // Debug line
        data.map((getdata)=>(
          getdata.email === email ? navigate("/app") : setError("Invalid credentials. Please try again.")
        ));
     
        } catch (error) {
          
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
                type="text" placeholder="username"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <input
                type="password" placeholder="password"
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <span style={{ color: "red" }}>{error}</span>}
            <button className="default" type="submit">Login</button>
          </form>
          </div>
      </div>
    </div>
  );
}

export default Login;