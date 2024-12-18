import React, { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./Home.css";
import Sidebar from "./components/Sidebar/Sidebar";
import YourDay from "./components/YourDay/YourDay";
import ToDo from "./components/ToDo/ToDo";
import YourHuddle from "./components/YourHuddle/YourHuddle";
import Notification from "./components/Notification/Notification";
import CoachProfile from "./components/CoachProfile/CoachProfile";
import Calendar from "./components/Calander/Calander";

//   const today = new Date();
//  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
export default function App() {
const [isNotificationOpen, setIsNotificationOpen] = useState(false);
const [iCoachprofileOpen,setIsCoachprofileOpen] = useState(false);
const toggleNotifications = () => {
  setIsNotificationOpen(!isNotificationOpen);
};
const toggleCoachprofile = () => {
  setIsCoachprofileOpen(!iCoachprofileOpen);
};
  return (
    <div className="app-container">
        {/* Sidebar (Constant) */}
        <div className="">
          <Sidebar />
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Top Panel (Header) */}
          <header className="top-panel">
            <h1>Happy Friday, Jack!</h1>
            <div className="header-badge">
              <i className="search-icon">🔍</i>
              <i className="notification-icon" onClick={toggleNotifications}
                style={{ cursor: "pointer" }}>🔔</i>
              <img
                src="https://via.placeholder.com/40"
                alt="Profile"
                className="profile-picture" onClick={toggleCoachprofile} />
            </div>
          </header>

          {/* Panels */}
          <div className="panels">
            {/* Left Panel */}
            <div className="left-panel">
              <YourDay />
            </div>

            {/* Right Panel */}
            <div className="right-panel">
              <ToDo />
              <YourHuddle />
            </div>
          </div>
          <div className="calendar-panel">
            <Calendar />
          </div>
          <CoachProfile
            isOpen={iCoachprofileOpen}
            onClose={toggleCoachprofile} />
        </div>
        <Notification
          isOpen={isNotificationOpen}
          onClose={toggleNotifications} />
      </div>
  );
}

