import React, { useState } from "react";
import { Icon } from "@iconify/react";
import "./Client.css";
import SchedulePopup from "./SchedulePopup";
import GoalPopup from "./GoalPopup";

const ClientProfile = ({
  profileData,
  isOpen,
  onClose,
  isProfileVisible,
  clientId,
  setCurrentPage,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isGoalPopupOpen, setIsGoalPopupOpen] = useState(false);
  const [goals, setGoals] = useState(profileData?.goals || []);
  const moods = profileData?.moods || [];
  const today = new Date().toISOString().split("T")[0];
  const todayIndex = moods.findIndex((mood) => mood.createdDate === today);
  const [currentIndex, setCurrentIndex] = useState(todayIndex !== -1 ? todayIndex : 0);

  // State to track which session tab (Upcoming/Past) is active
  const [activeSessionTab, setActiveSessionTab] = useState("upcoming");

  if (!profileData) {
    return <div>Loading...</div>;
  }

  const documents = profileData?.documents || [];

  // Filter upcoming and past sessions based on status
  const upcomingSessions = profileData?.upcomingSchedule?.filter(
    (session) => session.status !== "Completed"
  );
  const pastSessions = profileData?.upcomingSchedule?.filter(
    (session) => session.status === "Completed"
  );

  const handleDocumentDownload = (fileName) => {
    const url = `https://localhost:7046/api/CoachProfile/DownloadFile/${clientId}/${fileName}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
  };

  const handleAddGoal = (newGoal) => {
    setGoals([...goals, newGoal]);
  };

  const handlePlanSessionOpen = (session) => {
    if (typeof setCurrentPage === "function") {
      setCurrentPage("Plan Session", { ...profileData, upcomingSchedule: [session] });
    } else {
      console.error("❌ setCurrentPage is not defined or not a function");
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : moods.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < moods.length - 1 ? prev + 1 : 0));
  };

  const currentMood = moods[currentIndex];
  const getMoodImage = (moodType) => `/MOODS/${moodType.toUpperCase()}.png`;

  return (
    <div className={`clientprofile-panel ${isOpen ? "open" : ""}`}>
       <div className="header">
        <button className="close-button" onClick={onClose}>
          ✖
        </button>
        <h2>{profileData.name}'s Profile</h2>
      </div>
             {/* Profile Details Grid */}
      <div className="profile-details-grid">
        {/* Section 1: Profile and Sessions */}
        <div className="section1">
          {/* Profile Box */}
          <div className="profile-box">
            <div className="profile-header">
              <h4>PROFILE</h4>
            </div>
            <div className="profile-content">
              <div className="profile-pic-container">
                <img
                  src={
                    profileData.profileImage
                      ? profileData.profileImage
                      : "/ProfilePic/default-avatar.png"
                  }
                  alt="Profile"
                  className="profile-image"
                />
              </div>
              <h3 className="profile-name">{profileData.name}</h3>
              <button className="message-btn">Message</button>
            </div>
          </div>
          <div className="gap"></div>
          {/* Sessions Box */}
          <div className="session-box">
            <div className="session-header">
              <h4>SESSIONS</h4>
            </div>
            <div className="session-buttons-container">
              <div className="session-buttons">
                {/* Upcoming Button */}
                <button
                  className={`session-btn upcoming ${
                    activeSessionTab === "upcoming" ? "active" : ""
                  }`}
                  onClick={() => setActiveSessionTab("upcoming")}
                >
                  Upcoming
                </button>
                {/* Past Button */}
                <button
                  className={`session-btn past ${
                    activeSessionTab === "past" ? "active" : ""
                  }`}
                  onClick={() => setActiveSessionTab("past")}
                >
                  Past
                </button>
                {/* Display Upcoming Sessions */}
                {activeSessionTab === "upcoming" &&
                upcomingSessions?.length > 0 ? (
                  upcomingSessions.map((session, index) => (
                    <div key={index} className="session-info">
                      <p className="session-title">
                        {`${session.sessiontitle} - ${session.plannedDate} at ${session.plannedTime}`}
                      </p>
                      <button
                        className="session-btn plan"
                        onClick={() => handlePlanSessionOpen(session)}
                      >
                        Plan
                      </button>
                    </div>
                  ))
                ) : activeSessionTab === "upcoming" ? (
                  <p>No upcoming sessions</p>
                ) : null}
                {/* Display Past Sessions */}
                {activeSessionTab === "past" &&
                pastSessions?.length > 0 ? (
                  pastSessions.map((session, index) => (
                    <div key={index} className="session-info">
                      <p className="session-title">
                        {`${session.plannedDate} - ${session.sessiontitle}`}
                      </p>
                    </div>
                  ))
                ) : activeSessionTab === "past" ? (
                  <p>No past sessions</p>
                ) : null}
              </div>
              {/* Schedule Button */}
              <div className="schedule-btn">
                <button
                  className="session-btn schedule"
                  onClick={() => setIsPopupOpen(true)}
                >
                  + Schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Info and Goals */}
        <div className="section2">
          {/* Personal Information Box */}
          <div className="personalinfo-box">
            <div className="personalinfo-header">
              <h4>INFORMATION</h4>
            </div>
            <div className="info-details">
              <p><strong>Age:</strong> {profileData.age || "N/A"}</p>
              <p><strong>Occupation:</strong> {profileData.occupation || "N/A"}</p>
              <p><strong>Mobile:</strong> {profileData.mobile || "N/A"}</p>
              <p><strong>Email:</strong> {profileData.email || "N/A"}</p>
              <p><strong>Diagnosis:</strong> {profileData.diagnosis || "N/A"}</p>
              <p><strong>Medication:</strong> {profileData.medication || "N/A"}</p>
              <p><strong>Payment:</strong> {profileData.paymenttype || "N/A"}</p>
            </div>
          </div>
          <div className="gap"></div>
          {/* Goals Box */}
          <div className="goals-box">
            <div className="goals-header">
              <h4>GOALS</h4>
            </div>
            <div className="goals-container">
              <div className="goals-content">
                {goals.length === 0 && <p>No goals</p>}
                {goals.map((goal, index) => (
                  <div key={index} className="goal-item">
                    <div className="goal-icon">
                      <Icon
                        icon="mage:goals"
                        style={{ color: "#25376f", fontSize: "2.7rem" }}
                      />
                    </div>
                    <div className="goal-text">{goal}</div>
                  </div>
                ))}
              </div>
              <button
                className="add-button"
                onClick={() => setIsGoalPopupOpen(true)}
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Notes */}
        <div className="section3">
          <div className="notes-box">
            <div className="notes-header">
              <h4>NOTES</h4>
            </div>
            <div className="notes-details">
              <div className="notes-icon">
                <Icon
                  icon="nimbus:edit"
                  style={{ color: "#25376f", fontSize: "2.7rem" }}
                />
              </div>
              <div className="notes-list">
                {profileData?.notes?.length === 0 && <p>No notes</p>}
                {profileData?.notes?.map((item, index) => (
                  <p key={index} className="notes-item">
                    <span className="notes-text">{item}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Mood and Documents */}
        <div className="section4">
          {/* Mood Box */}
          <div className="moods-box">
            <div className="moods-header">
              <h4>MOOD</h4>
            </div>
            <div className="moods-details">
              {profileData?.moods?.length === 0 && <p>No data</p>}
              {profileData?.moods?.length > 0 && (
                <div className="mood-item">
                  <div className="mood-date">
                    <Icon
                      icon="flat-color-icons:previous"
                      onClick={handlePrevious}
                      width="20"
                      height="20"
                    />
                    {currentMood.createdDate}
                    <Icon
                      icon="flat-color-icons:next"
                      onClick={handleNext}
                      width="20"
                      height="20"
                    />
                  </div>
                  <div className="mood-icon">
                    <img
                      src={getMoodImage(currentMood.moodType)}
                      alt={currentMood.moodType}
                    />
                  </div>
                  <div className="mood-text">{currentMood.moodType}</div>
                </div>
              )}
            </div>
          </div>
          <div className="gap"></div>
          {/* Documents Box */}
          <div className="document-box">
            <div className="document-header">
              <h4>DOCS</h4>
            </div>
            <div className="document-content">
              {documents.length === 0 ? (
                <p>No documents available.</p>
              ) : (
                <ul>
                  {documents.map((doc, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleDocumentDownload(doc)}
                        className="document-link"
                      >
                        {index + 1}. {doc}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Popup */}
      {isPopupOpen && (
        <SchedulePopup
          onClose={() => setIsPopupOpen(false)}
          clientName={profileData.name}
          profileData={profileData}
        />
      )}

      {/* Goal Popup */}
      {isGoalPopupOpen && (
        <GoalPopup
          onClose={() => setIsGoalPopupOpen(false)}
          onSave={handleAddGoal}
          profileData={profileData}
        />
      )}
    </div>
  );
};

export default ClientProfile;