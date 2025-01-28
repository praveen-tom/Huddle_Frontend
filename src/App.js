import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import { UserProvider } from "./Context/UserContext";
import Login from "./Login";
import Home from "./Home"; 

function App() {
  return (
    <UserProvider>
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />
          <Route path="/app" element={<Home />} />
      </Routes>
    </BrowserRouter>
    </UserProvider>
  );
}

export default App;
