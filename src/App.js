import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Home from "./Home"; // HomePage is the entry point for all other components.

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route for the Login page */}
        <Route path="/" element={<Login />} />

        {/* Route for the Main App content */}
        <Route path="/App" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;