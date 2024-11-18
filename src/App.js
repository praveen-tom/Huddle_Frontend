import React from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import YourDay from "./components/YourDay";
import ToDo from "./components/ToDo";

function App() {
  const today = new Date();
  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });

  return (
    <div className="app">
      <Sidebar />
      <div className="main-content">
        <header className="header">
          <h1>Happy {dayName}!</h1>
        </header>
        <div className="content">
          <YourDay />
          <ToDo />
        </div>
      </div>
    </div>
  );
}

export default App;
