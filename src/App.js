import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify"; 
import "react-toastify/dist/ReactToastify.css"; 
import Login from "./Login";
import Home from "./Home"; 

function App() {
  return (
    <BrowserRouter>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<Login />} />

        <Route path="/App" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
