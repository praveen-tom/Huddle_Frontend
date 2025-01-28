import React from "react";
import { Icon } from "@iconify/react";
import "./Client.css";

const ClientProfile = ({ profileData, onClose, isProfileVisible, clientId }) => {
  if (!profileData) {
    return <div>Loading...</div>; // Handle loading or null state
  }

  const goals = profileData?.goals || [];
  const documents = profileData?.documents || []; // Destructure documents here

  // Function to handle document download
  const handleDocumentDownload = (fileName) => {
    const clientId = "af89ac3a-fc13-4aff-9fc8-c0dbf15ec794";
    const url = `https://localhost:7046/api/CoachProfile/DownloadFile/${clientId}/${fileName}`;
    // Create an invisible anchor element to download the file
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName; // Optional: you can also set a custom filename
    link.click();
  };

  return (
    <div className={`modal-content ${isProfileVisible ? "open" : ""}`}>
      <div className="header">
        <h2>{profileData.name}'s Profile</h2>
        <button onClick={onClose} className="close-button">
          &#10006;
        </button>
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
              </div>
              <div className="schedule-btn">
                <button className="session-btn schedule">+ Schedule</button>
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
            <div className="goal-icon"> <Icon icon="mage:goals" style={{ color:"25376f", size:"2.7rem"  }}/></div>
            <div className="goal-text">{goal}</div>
          </div>
          ))}
          </div>
          <button className="add-button">+ Add</button>
          </div>
        </div>
        </div>

        <div className="section3">
        <div className="notes-box">
          <div className="notes-header">
          <h4>NOTES</h4>
          </div>
          <div className="notes-details">
          <div className="notes-icon"><Icon icon="nimbus:edit" style={{ color:"25376f", size:"2.7rem"  }}/></div>
          <div className="notes-list">
            {notes.length === 0 && <p>No notes</p>}
          {notes.map((item, index) => (
            <p key={index} className="notes-item">
              <span className="notes-text">{item}</span>
            </p>
          ))}
      </div>
          </div>
        </div>
        </div>

        <div className="section4">
        <div className="moods-box">
          <div className="moods-header">
          <h4>MOOD</h4>
          </div>
          <div className="moods-details">
           
          </div>
        </div>
        <div className="gap"></div>
        <div className="document-box">
          <div className="document-header">  
          <h4>DOCS</h4>
          </div>
          <div className="document-content">
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
