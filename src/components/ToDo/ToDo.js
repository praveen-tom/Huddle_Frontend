import React, { useState, useContext } from "react";
import { Icon } from "@iconify/react";
import "./ToDo.css";
import { toast } from "react-toastify";
import API_ENDPOINTS from "../../apiconfig";
import { UserContext } from "../../Context/UserContext";

function ToDo() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Invite new client to Huddle", clickable: true },
    { id: 2, text: "Upload session review", clickable: true },
    { id: 3, text: "Upload resource", clickable: false },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [reviewText, setReviewText] = useState("");
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "" });
  const [emailError, setEmailError] = useState("");
  const [isInviteSent, setIsInviteSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState(false);
  const [profiles, setProfiles] = useState([]);
  const { user } = useContext(UserContext);
  const coachId = user?.id;

  const handleOpenModal = () => {
    setShowModal(true);
    setIsInviteSent(false);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: "", mobile: "", email: "" });
    setEmailError("");
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "email" && emailError) setEmailError("");
  };

  const handleSendInvite = async () => {
    if (!validateEmail(formData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };
    try {
      console.log("Sending invite request:", requestOptions);
      const response = await fetch(`${API_ENDPOINTS.baseurl}/Client`, requestOptions);
      if (response.ok) {
        setIsInviteSent(true);
      } else {
        const errorData = await response.json();
        console.error("API Error (Send Invite):", errorData);
        alert(`Failed to send invite: ${errorData.message || "Unknown error occurred"}`);
      }
    } catch (error) {
      console.error("Network/Error during Send Invite:", error.message);
      alert("An unexpected error occurred while sending the invite. Please try again later.");
      setErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleErrorPopupClose = () => setErrorPopup(false);

  const handleOpenReviewModal = (profile) => {
    setSelectedProfile(profile);
    setShowReviewModal(true);
  };

  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setSelectedProfile(null);
    setReviewText("");
  };

  const handleFetchProfiles = async () => {
    if (!coachId) {
      alert("Coach info unavailable. Please sign in again.");
      return;
    }

    setLoading(true);
    try {
      console.log(`Fetching profiles for coachId: ${coachId}`);
      const response = await fetch(
        `${API_ENDPOINTS.baseurl}/Coach/getCompletedSessionByCoachId/${coachId}`
      );
      if (response.ok) {
        const data = await response.json();
        console.log("API Response (Fetch Profiles):", data);
        if (data.status === 200 && Array.isArray(data.data)) {
          setProfiles(data.data);
        } else {
          console.error("Invalid API Response Format (Fetch Profiles):", data);
          throw new Error("Invalid API response format for profiles");
        }
      } else {
        const errorData = await response.json();
        console.error("API Error (Fetch Profiles):", errorData);
        throw new Error("Failed to fetch profiles");
      }
    } catch (error) {
      console.error("Network/Error during Fetch Profiles:", error.message);
      alert("Error fetching profiles. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendReview = async () => {
    if (!reviewText.trim()) {
      alert("Please enter a review.");
      return;
    }
    setLoading(true);

    // Use sessionId instead of profileId in the payload
    const payload = {
      sessionId: selectedProfile.sessionId, // Ensure sessionId exists in the profile object
      review: reviewText,
    };

    const requestOptions = {
      method: "POST", // Switched to POST if PATCH is not supported
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    try {
      console.log("Sending review request:", requestOptions);
      const response = await fetch(
        `${API_ENDPOINTS.baseurl}/PlannedSession/shareReview`, // Adjust endpoint if needed
        requestOptions
      );

      // Log raw response for debugging
      const rawResponse = await response.text();
      console.log("Raw Response:", rawResponse);

      // Parse JSON only if the response is not empty
      let responseData;
      try {
        responseData = JSON.parse(rawResponse);
      } catch (parseError) {
        console.error("Failed to parse JSON response:", parseError);
        responseData = { message: "Invalid server response" };
      }

      if (response.ok) {
        toast.success("Review shared successfully!");
        handleCloseReviewModal();
      } else {
        console.error("API Error (Share Review):", responseData);
        alert(`Failed to share review: ${responseData.message || "Unknown error occurred"}`);
      }
    } catch (error) {
      console.error("Network/Error during Share Review:", error.message);
      alert("An unexpected error occurred while sharing the review. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="to-do">
      {/* Header */}
      <div className="header">TO DO</div>

      {/* Task List */}
      <ul className="task-list">
        {tasks.map((task) => (
          <li
            key={task.id} // Ensure unique key
            className={`task-item ${task.clickable ? "clickable" : ""}`}
            onClick={
              task.clickable
                ? task.id === 2
                  ? handleFetchProfiles
                  : handleOpenModal
                : null
            }
          >
            <span className="task-icon">📧</span>
            <span className="task-text">{task.text}</span>
            <span className="task-delete">×</span>
          </li>
        ))}
      </ul>

      {/* Modal for Adding Client */}
      {showModal && (
        <>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
          <div className="modal">
            <div className="btn-close">
              <button className="modal-close" onClick={handleCloseModal}>
                <Icon icon="mdi:close-thick" style={{ color: "white", fontSize: "1.6rem" }} />
              </button>
            </div>
            <div className="modal-header">
              <Icon icon="mdi:invite" style={{ color: "white", fontSize: "4.7rem" }} />
              {!isInviteSent ? (
                <span className="modal-title">Add a new client</span>
              ) : (
                <span className="modal-title">Invitation Sent</span>
              )}
            </div>
            {!isInviteSent ? (
              <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="modal-input"
                />
                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="modal-input"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="modal-input"
                />
                {emailError && <div className="error-message">{emailError}</div>}
                <div className="model-btn">
                  <button type="button" className="modal-submit" onClick={handleSendInvite}>
                    Send Invite
                  </button>
                </div>
              </form>
            ) : (
              <div className="confirmation">
                <Icon
                  icon="line-md:circle-to-confirm-circle-transition"
                  style={{ color: "#1a274f", fontSize: "10rem" }}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Modal for Sharing Review */}
      {showReviewModal && (
        <>
          <div className="modal-backdrop" onClick={handleCloseReviewModal}></div>
          <div className="modal">
            <div className="btn-close">
              <button className="modal-close" onClick={handleCloseReviewModal}>
                <Icon icon="mdi:close-thick" style={{ color: "white", fontSize: "1.6rem" }} />
              </button>
            </div>
            <div className="modal-header">
              <Icon icon="mdi:file-document" style={{ color: "white", fontSize: "4.7rem" }} />
              <span className="modal-title">Share Review</span>
            </div>
            <div className="modal-form">
              <textarea
                className="modal-input review-textarea"
                placeholder="Enter your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
              />
              <div className="model-btn">
                <button type="button" className="modal-submit" onClick={handleSendReview}>
                  Submit Review
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Popup for Profiles */}
      {loading && !showModal && !showReviewModal && (
        <div className="loading-popup">
          <div className="popup-content">
            <p>Loading...</p>
          </div>
        </div>
      )}
      {profiles.length > 0 && !showModal && !showReviewModal && (
        <>
          <div className="modal-backdrop" onClick={() => setProfiles([])}></div>
          <div className="modal">
            <div className="btn-close">
              <button className="modal-close" onClick={() => setProfiles([])}>
                <Icon icon="mdi:close-thick" style={{ color: "white", fontSize: "1.6rem" }} />
              </button>
            </div>
            <div className="modal-header">
              <Icon icon="mdi:account-group" style={{ color: "white", fontSize: "4.7rem" }} />
              <span className="modal-title">Completed Profiles</span>
            </div>
            <div className="modal-form">
              <ul className="profile-list">
                {profiles.map((profile) => (
                  <li key={profile.id} className="profile-item">
                    <span>
                      {profile.clientName} - <strong>{profile.sessionTitle}</strong>
                    </span>
                    <button
                      className="share-review-btn"
                      onClick={() => handleOpenReviewModal(profile)}
                    >
                      Share Review
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}

      {/* Error Popup */}
      {errorPopup && (
        <>
          <div className="modal-backdrop" onClick={handleErrorPopupClose}></div>
          <div className="error-popup">
            <button className="popup-close" onClick={handleErrorPopupClose}>
              ×
            </button>
            <div className="popup-content">
              <span>
                Something went wrong. Please try again later. If the issue persists, please call
                support.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ToDo;