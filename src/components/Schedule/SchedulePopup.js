import React, { useState, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import "./SchedulePopup.css";
import { UserContext } from "../../Context/UserContext";

const SchedulePopup = ({ clientName, onClose, profileData }) => {
  const { user } = useContext(UserContext);
  const [selectedRange, setSelectedRange] = useState([]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDateSelect = (selectionInfo) => {
    const startDate = selectionInfo.start;
    const endDate = selectionInfo.end;
    setSelectedRange([startDate, endDate]);
  };

  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a session title.");
      return;
    }

    if (selectedRange.length < 1) {
      alert("Please select a date range.");
      return;
    }

    const sessionData = {
      Id: "",
      CoachId: user.id,
      ClientId: profileData?.ClientId || "",
      ClientEmail: profileData.email,
      Sessiontitle: title,
      Sessiondates: [formatDate(selectedRange[0])],
      PlannedDate: formatDate(selectedRange[0]),
      PlannedTime: "",
      Status: "Pending",
      CreatedBy: user?.id || "",
      CreatedDatetime: new Date().toISOString(),
      ModifiedBy: "",
      ModifiedDatetime: new Date().toISOString(),
    };

    try {
      const response = await fetch("https://localhost:7046/api/SessionScheduling", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage(result.message || "Email sent successfully.");
        setIsSuccess(true);
      } else {
        setMessage(result.message || "Failed to schedule session.");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Error scheduling session. Please try again.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Schedule Session</h3>
        <p>
          <strong>For:</strong> {clientName}
        </p>
        {message ? (
          <>
            <p className={isSuccess ? "success-message" : "error-message"}>{message}</p>
            <button className="close-btn" onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Title"
              className="title-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              selectable={true}
              select={handleDateSelect}
              events={[]}
            />
            <button className="send-btn" onClick={handleSubmit}>Send</button>
            <button className="close-btn" onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </div>
  );
};

export default SchedulePopup;
