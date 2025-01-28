import React, { useContext, useState } from "react";
import { UserContext } from "./Context/UserContext";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import API_ENDPOINTS from "./apiconfig";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(UserContext);

  const handleLogin = (e) => {
    e.preventDefault();
      const fetchData = async()=>{
        
        try {
          const response = await fetch(API_ENDPOINTS.getCoachProfile);
          console.log(response);
          if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
          }
          return;
        }
        const data = await response.json();
        console.log("data",data); // Debug line
        console.log("imputemail",email); // Debug line
        const isvalid = data.find((getdata)=> getdata.email === email);
        console.log("valid",isvalid);
        if(isvalid)
        {
           login({name:isvalid.name,id:isvalid.id});
          navigate("/app"); 
        }
        else
        {
          setError("Invalid credentials. Please try again.");
        }
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
