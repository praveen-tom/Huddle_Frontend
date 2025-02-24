import React, { useState } from "react";
import { Icon } from "@iconify/react";
import "./Client.css";
import SchedulePopup from "./SchedulePopup";
import GoalPopup from "./GoalPopup"; 
const ClientProfile = ({
  profileData,
  onClose,
  isProfileVisible,
  clientId,
  setCurrentPage,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false); 
  const [isGoalPopupOpen, setIsGoalPopupOpen] = useState(false); 
  const [goals, setGoals] = useState(profileData?.goals || []);

  if (!profileData) {
    return <div>Loading...</div>; 
  }

  const documents = profileData?.documents || [];

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

  const handlePlanSessionOpen = () => {
    if (typeof setCurrentPage === "function") {
      setCurrentPage("Plan Session"); 
    } else {
      console.error("❌ setCurrentPage is not defined or not a function");
    }
  };

  return (
    <div className={`modal-content ${isProfileVisible ? "open" : ""}`}>
      <div className="header">
        <h2>{profileData.name}'s Profile</h2>
        {/* <button onClick={onClose} className="close-button">
          &#10006;
        </button> */}
      </div>
      <div className="profile-details-grid">
        <div className="section1">
          <div className="profile-box">
            <div className="profile-header">
              <h4>PROFILE</h4>
            </div>
            <div className="profile-content">
              <div className="profile-pic-container">
                <img
                  src={profileData.profileImage}
                  alt="Profile"
                  className="profile-image"
                />
              </div>
              <h3 className="profile-name">{profileData.name}</h3>
              <button className="message-btn">Message</button>
            </div>
          </div>
          <div className="gap"></div>
          <div className="session-box">
            <div className="session-header">
              <h4>SESSIONS</h4>
            </div>
            <div className="session-buttons-container">
              <div className="session-buttons">
                <button className="session-btn upcoming">Upcoming</button>
                <button className="session-btn past">Past</button>
                {profileData?.upcommingSchedule && (
                  <div className="session-info">
                    <p className="session-title">
                      {profileData.upcommingSchedule.sessiontitle}
                      </p>
                    <button
                      className="session-btn plan"
                      onClick={handlePlanSessionOpen} 
                    >
                      Plan
                    </button>
                  </div>
                )}
              </div>
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
        <div className="section2">
          <div className="personalinfo-box">
            <div className="personalinfo-header">
              <h4>Information</h4>
            </div>
            <div className="info-details">
              <p><strong>Age:</strong> {profileData.age}</p>
              <p><strong>Occupation:</strong> {profileData.occupation}</p>
              <p><strong>Mobile:</strong> {profileData.mobile}</p>
              <p><strong>Email:</strong> {profileData.email}</p>
              <p><strong>Diagnosis:</strong> {profileData.diagnosis}</p>
              <p><strong>Medication:</strong> {profileData.medication}</p>
              <p><strong>Payment:</strong> {profileData.paymenttype}</p>
            </div>
          </div>
          <div className="gap"></div>
          <div className="goals-box">
            <div className="goals-header">
              <h4>Goals</h4>
            </div>
            <div className="goals-container">
              <div className="goals-content">
                {goals.length === 0 && <p>No goals</p>}
                {goals.map((goal, index) => (
                  <div key={index} className="goal-item">
                    <div className="goal-icon">
                      <Icon icon="mage:goals" style={{ color: "#25376f", fontSize: "2.7rem" }} />
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
        <div className="section3">
          <div className="notes-box">
            <div className="notes-header">
              <h4>NOTES</h4>
            </div>
            <div className="notes-details">
              <div className="notes-icon">
                <Icon icon="nimbus:edit" style={{ color: "#25376f", fontSize: "2.7rem" }} />
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
