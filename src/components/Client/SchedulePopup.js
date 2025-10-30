import React, { useState, useContext, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./SchedulePopup.css";
import { UserContext } from "../../Context/UserContext";
import API_ENDPOINTS from "../../apiconfig";

const SchedulePopup = ({ clientName, onClose, profileData }) => {
  const { user } = useContext(UserContext);
  const [selectedRange, setSelectedRange] = useState([new Date(), new Date()]);
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [sessionschedulingData, setSessionData] = useState(null);
  const [dateCounts, setDateCounts] = useState({});

  
  console.log("Clients Profile Data:", profileData);
  const handleDateChange = (range) => {
    if (range && range.length === 2 && range[0] >= new Date()) {
      setSelectedRange(range);
    }
  };
  console.log("Session Scheduling Data:", sessionschedulingData);
  useEffect(() => {
   const fetchSessionData = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.baseurl}/SessionScheduling/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        const scheduledSessions = (data.data || []).filter(
          (session) => session.status === "Scheduled" || session.status === "Pending"
        );
        setSessionData(scheduledSessions); // Save the session data in state
        
        // Count sessions per PlannedDate
        const counts = {};
        scheduledSessions.forEach((session) => {
          const date = session.plannedDate;
          counts[date] = (counts[date] || 0) + 1;
        });
        setDateCounts(counts);


      } catch (error) {
        console.error("Error fetching session data:", error);
      }
    };
    if (user?.id) {
      fetchSessionData();
    }
  },  [user?.id]);
    
  const getDateRangeArray = (startDate, endDate) => {
    let dates = [];
    let currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  };

    // Helper to format date as dd-mm-yyyy
  const formatDate = (date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

   const tileClassName = ({ date, view }) => {
    if (view === "month") {
      const key = formatDate(date);
      const count = dateCounts[key] || 0;
      if (count >= 7) return "calendar-red";      // Low availability
      if (count >= 3 && count <= 6 ) return "calendar-orange";   // Medium availability
      if (count >= 1 && count <=2) return "calendar-green";    // High availability
      // No sessions = default
    }
    return null;
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
      ClientId: profileData.clientId || "",  
      ClientEmail: profileData.email || "",  
      Sessiontitle: profileData.upcomingSchedule?.sessiontitle || title.trim(), 
      Sessiondates: profileData.upcomingSchedule?.sessiondates || sessionDates, 
      PlannedDate: formatDate(selectedRange[0]), 
      PlannedTime: "", 
      Status: "Pending", 
      CreatedBy: user?.id || "", 
      CreatedDatetime: new Date().toISOString(), 
      ModifiedBy: "",
      ModifiedDatetime: new Date().toISOString(), 
    };
    
    console.log("sessiondata" , sessionData);
    try {
      const response = await fetch(`${API_ENDPOINTS.baseurl}/SessionScheduling`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionData),
      });

      const result = await response.json();
      console.log("Response from server:", result);

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
              onChange={setSelectedRange}
              value={selectedRange}
              selectRange={true}
              minDate={new Date()}
              tileClassName={tileClassName}
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
