import React, { useState } from "react";
import { Icon } from "@iconify/react";
import "./ToDo.css";
import { toast } from "react-toastify";

function ToDo() {
  const [tasks, setTasks] = useState([
    { id: 1, text: "Invite new client to Huddle", clickable: true },
    { id: 2, text: "Upload session review for Bella's session", clickable: false },
    { id: 3, text: "Upload resource", clickable: false },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "" });
  const [emailError, setEmailError] = useState("");
  const [isInviteSent, setIsInviteSent] = useState(false);

  const handleOpenModal = () => {
    setShowModal(true);
    setIsInviteSent(false); // Reset invite status on modal open
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

    setLoading(true); // Set loading to true when the request starts

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    try {
      const response = await fetch("https://localhost:7046/api/Client", requestOptions);

      if (response.ok) {
        setIsInviteSent(true); // Set invite sent flag
      } else {
        const errorData = await response.json();
        alert(`Failed to send invite: ${errorData.message || "Unknown error occurred"}`);
      }
    } catch (error) {
      handleCloseModal(); // Close the client info form on error
      setErrorPopup(true); // Show the error popup
    } finally {
      setLoading(false); // Reset loading state when request completes
    }
  };

  const handleErrorPopupClose = () => setErrorPopup(false); // Close the error popup

  return (
    <div className="to-do">
      <div className="header">TO DO</div>
      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task.id} className={`task-item ${task.clickable ? "clickable" : ""}`}>
            <span className="task-icon">📄</span>
            <span className="task-text" onClick={task.clickable ? handleOpenModal : null}>
              {task.text}
            </span>
            <span className="task-delete">❌</span>
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
              {!isInviteSent ?(
                <span className="modal-title">Add a new client</span>
              ):
              (
                <span className="modal-title">Invitation Sent</span>
              )
              }
              
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
                <button
                  type="button"
                  className="modal-submit"
                  onClick={handleSendInvite}
                >
                  Send Invite
                </button>
                </div>
              </form>
            ) : (
              <div className="confirmation">
                <Icon
                  icon="line-md:circle-to-confirm-circle-transition"
                  style={{ color: "1a274f", fontSize: "10rem" }}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Error Popup */}
      {errorPopup && (
        <>
          <div className="modal-backdrop" onClick={handleErrorPopupClose}></div>
          <div className="error-popup">
            <button className="popup-close" onClick={handleErrorPopupClose}>
              ❌
            </button>
            <div className="popup-content">
              <span>
                Something went wrong. Please try again later. If the issue
                persists, please call support.
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default ToDo;
