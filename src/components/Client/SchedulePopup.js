import React, { useState, useContext } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./SchedulePopup.css";
import { UserContext } from "../../Context/UserContext";

const SchedulePopup = ({ clientName, onClose, profileData }) => {
  const { user } = useContext(UserContext);
  const [selectedRange, setSelectedRange] = useState([new Date(), new Date()]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  
  console.log("Clients Profile Data:", profileData);
  const handleDateChange = (range) => {
    if (range && range.length === 2 && range[0] >= new Date()) {
      setSelectedRange(range);
    }
  };

  const getDateRangeArray = (startDate, endDate) => {
    let dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
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

    const sessionDates = getDateRangeArray(selectedRange[0], selectedRange[1]);

    const sessionData = {
      Id: "", 
      CoachId: user.id,
      ClientId: profileData?.data?.clientId || "",  
      ClientEmail: profileData?.data?.email || "",  
      Sessiontitle: profileData?.data?.upcomingSchedule?.sessiontitle || title.trim(), 
      Sessiondates: profileData?.data?.upcomingSchedule?.sessiondates || sessionDates, 
      PlannedDate: formatDate(selectedRange[0]), 
      PlannedTime: "", 
      Status: "Pending", 
      CreatedBy: user?.id || "", 
      CreatedDatetime: new Date().toISOString(), 
      ModifiedBy: "",
      ModifiedDatetime: new Date().toISOString(), 
    };
    
    
    console.log(sessionData);
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
            <Calendar
              onChange={handleDateChange}
              value={selectedRange}
              selectRange={true}
              minDate={new Date()}
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
