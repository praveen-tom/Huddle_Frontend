import React, { useContext, useState } from "react";
import "./Home.css";
import Sidebar from "./components/Sidebar/Sidebar";
import YourDay from "./components/YourDay/YourDay";
import ToDo from "./components/ToDo/ToDo";
import YourHuddle from "./components/YourHuddle/YourHuddle";
import Notification from "./components/Notification/Notification";
import CoachProfile from "./components/CoachProfile/CoachProfile";
import Calendar from "./components/Calander/Calander";
import Client from "./components/Client/Client";
import { UserContext } from "./Context/UserContext";
import { Icon } from "@iconify/react";

export default function Home() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCoachProfileOpen, setIsCoachProfileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("Daily Huddle"); // Track the active page
  const{user} = useContext(UserContext);
  const{notificationCount} = useContext(UserContext);

  console.log("User context value in this component:", user); // Debug line

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const toggleCoachProfile = () => {
    setIsCoachProfileOpen(!isCoachProfileOpen);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "Daily Huddle":
        return (
          <>
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
          </>
        );
      case "My Huddle":
        return <Client />; // Render only "Your Huddle" component for My Huddle page
      case "Chats":
        return <div>Chats Page</div>; // Placeholder for Chats
      case "Payments Settings":
        return <div>Payments Settings Page</div>; // Placeholder for Payments Settings
      case "The Huddle Heap":
        return <div>The Huddle Heap Page</div>; // Placeholder for The Huddle Heap
      default:
        return <div>Page Not Found</div>;
    }
  };

  return (
    <div className="app-container">
      <div>
        <Sidebar setCurrentPage={setCurrentPage} /> {/* Pass setCurrentPage to Sidebar */}
      </div>
      <div className="main-content">
        <header className="top-panel">
          <h1>Happy Friday, {user?.name}!</h1>
          <div className="header-badge">
            <i className="search-icon">🔍</i>
            <div className="notification-icon-container">
            <Icon  icon="mingcute:notification-line" className="notification-icon"
              onClick={toggleNotifications}
              style={{ cursor: "pointer", color: "gray", fontSize: "2.0rem" }} />
               <div className="notification-count">{notificationCount}</div>
              </div>
             <Icon className="profile-picture" onClick={toggleCoachProfile} icon="codicon:account"
              style={{ color: "1a274f", fontSize: "1.7rem",cursor:"pointer" }}/>
          </div>
        </header>
        {renderPage()} {/* Render the current page dynamically */}
        <CoachProfile isOpen={isCoachProfileOpen} onClose={toggleCoachProfile} />
      </div>
      <Notification isOpen={isNotificationOpen} onClose={toggleNotifications} />
    </div>
  );
}
