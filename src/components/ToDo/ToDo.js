import React, { useState } from "react";
import "./ToDo.css";

function ToDo() {
  const tasks = [
    { text: "Invite new client to Huddle", clickable: true },
    { text: "Upload session review for Bella's session", clickable: false },
    { text: "Upload resource", clickable: false },
  ];

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "" });
  const [emailError, setEmailError] = useState("");

  const handleOpenModal = () => setShowModal(true);
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
    if (e.target.name === "email" && emailError) setEmailError(""); // Clear email error
  };

  const handleSendInvite = async () => {
    if (!validateEmail(formData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    const requestOptions = {
      method: "POST", // Explicitly specifying POST method
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    try {
      const response = await fetch("https://localhost:7046/api/Client", requestOptions);

      if (response.ok) {
        alert("Client invited successfully!");
        handleCloseModal(); // Reset modal and form state
      } else {
        const errorData = await response.json();
        alert(`Failed to send invite: ${errorData.message || 'Unknown error occurred'}`);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An unexpected error occurred.");
    }
  };

  return (
    <div className="to-do">
      <div className="header">TO DO</div>
      <ul className="task-list">
        {tasks.map((task, index) => (
          <li
            key={index}
            className={`task-item ${task.clickable ? "clickable" : ""}`}
          >
            <span className="task-icon">📄</span>
            <span
              className="task-text"
              onClick={task.clickable ? handleOpenModal : null}
            >
              {task.text}
            </span>
            <span className="task-delete">❌</span>
          </li>
        ))}
      </ul>

      {/* Modal */}
      {showModal && (
        <>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Add a new client</span>
              <button className="modal-close" onClick={handleCloseModal}>
                ❌
              </button>
            </div>
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
              <button
                type="button"
                className="modal-submit"
                onClick={handleSendInvite}
              >
                Send Invite
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default ToDo;
