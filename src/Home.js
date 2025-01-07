import React, { useState } from "react";
import "./Home.css";
import Sidebar from "./components/Sidebar/Sidebar";
import YourDay from "./components/YourDay/YourDay";
import ToDo from "./components/ToDo/ToDo";
import YourHuddle from "./components/YourHuddle/YourHuddle";
import Notification from "./components/Notification/Notification";
import CoachProfile from "./components/CoachProfile/CoachProfile";
import Calendar from "./components/Calander/Calander";

export default function App() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCoachProfileOpen, setIsCoachProfileOpen] = useState(false);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const toggleCoachProfile = () => {
    setIsCoachProfileOpen(!isCoachProfileOpen);
  };

  return (
    <div className="app-container">
      <div>
        <Sidebar />
      </div>
      <div className="main-content">
        <header className="top-panel">
          <h1>Happy Friday, Jack!</h1>
          <div className="header-badge">
            <i className="search-icon">🔍</i>
            <i
              className="notification-icon"
              onClick={toggleNotifications}
              style={{ cursor: "pointer" }}
            >
              🔔
            </i>
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="profile-picture"
              onClick={toggleCoachProfile}
            />
          </div>
        </header>
        <div className="panels">
          <div className="left-panel">
            <YourDay />
          </div>
          <div className="right-panel">
            <ToDo />
            <YourHuddle />
          </div>
        </div>
        <div className="calendar-panel">
          <Calendar />
        </div>
        <CoachProfile isOpen={isCoachProfileOpen} onClose={toggleCoachProfile} />
      </div>
      <Notification isOpen={isNotificationOpen} onClose={toggleNotifications} />
    </div>
  );
}
