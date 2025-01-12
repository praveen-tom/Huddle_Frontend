import React from "react";
import "./Client.css";

const ClientProfile = ({ profileData, onClose, isProfileVisible }) => {
  const goals = profileData && profileData.goals ? profileData.goals : [];

  return (
    <div className={`modal-content ${isProfileVisible ? "open" : ""}`}>
      <div className="header">
        <h2>{profileData.name}'s Profile</h2>
        <button onClick={onClose} className="close-button">
          &#10006;
        </button>
      </div>
      <div className="profile-details-grid">
        <div className="profile-box">
          <h4>Basic Info</h4>
          <div className="profile-pic-container">
            <img
              src={profileData.profileImage}
              alt={`${profileData.name}'s profile`}
              className="profile-image"
            />
          </div>
          <h4 className="profile-name">{profileData.name}</h4>
          <button className="message-btn">Message</button>
        </div>

        <div className="profile-box">
          <h4>Sessions</h4>
          <div className="session-buttons-container">
            <button className="session-btn">Upcoming</button>
            <button className="session-btn">Past</button>
          </div>
        </div>

        <div className="profile-box">
          <h4>Information</h4>
          <div className="info-details">
            <p><strong>Qualification:</strong> {profileData.qualification}</p>
            <p><strong>Mobile:</strong> {profileData.mobile}</p>
            <p><strong>Email:</strong> {profileData.email}</p>
            <p><strong>Age:</strong> {profileData.age}</p>
          </div>
        </div>

        <div className="profile-box">
          <h4>Goals</h4>
          <ul>
            {goals.length > 0 ? (
              goals.map((goal, index) => (
                <li key={index}>{goal}</li>
              ))
            ) : (
              <li>No goals listed</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;
