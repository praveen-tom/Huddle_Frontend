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
import PlanSession from "./components/Client/PlanSession"; 
import Chat from "./components/Chat/Chat"; // Import the Chat component
import { UserContext } from "./Context/UserContext";
import { Icon } from "@iconify/react";
import UploadPreview from "./components/TextToSpeech/TextToSpeech/UploadPreview";
import ArticleContent from './components/TextToSpeech/ArticleContent';

export default function Home() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isCoachProfileOpen, setIsCoachProfileOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState("Daily Huddle"); 
  const [selectedProfileData, setSelectedProfileData] = useState(null);
  const { user } = useContext(UserContext);
  const { notificationCount } = useContext(UserContext);

  const toggleNotifications = () => {
    setIsNotificationOpen(!isNotificationOpen);
  };

  const toggleCoachProfile = () => {
    setIsCoachProfileOpen(!isCoachProfileOpen);
  };

  const handleSetCurrentPage = (page, profileData = null) => {
    setCurrentPage(page);
    setSelectedProfileData(profileData);
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
        return <Client setCurrentPage={handleSetCurrentPage} />;
      case "Plan Session":
        return <PlanSession profileData={selectedProfileData}  setCurrentPage={handleSetCurrentPage} />; 
      case "Chats":
        return <Chat setCurrentPage={handleSetCurrentPage}/>
      case "Payments Settings":
        return <div>Payments Settings Page</div>;
      case "The Huddle Heap":
        return (
          <div style={{ padding: '2rem', maxWidth: 900, margin: '0 auto' }}>
            <ArticleContent />
          </div>
        );
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
              <Icon
                icon="mingcute:notification-line"
                className="notification-icon"
                onClick={toggleNotifications}
                style={{ cursor: "pointer", color: "gray", fontSize: "2.0rem" }}
              />
              <div className="notification-count">{notificationCount}</div>
            </div>
            <Icon
              className="profile-picture1"
              onClick={toggleCoachProfile}
              icon="codicon:account"
              style={{ color: "1a274f", fontSize: "1.7rem", cursor: "pointer" }}
            />
          </div>
        </header>
        {renderPage()} {/* Dynamically render the current page */}
        <CoachProfile isOpen={isCoachProfileOpen} onClose={toggleCoachProfile} />
      </div>
      <Notification isOpen={isNotificationOpen} onClose={toggleNotifications} />
    </div>
  );
}
