import React, { useState } from "react";
import "./YourHuddle.css";

const YourHuddle = () => {
  const huddles = ["Task Remainder", "Session Remainder", "Payment Remainder"];

  return (
    <div className="your-huddle">
      <div className="header">YOUR HUDDLE</div>
      <ul className="huddle-list">
        {huddles.map((item, index) => (
          <HuddleItem key={index} text={item} />
        ))}
      </ul>
    </div>
  );
};

const HuddleItem = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBellClick = async () => {
    if (text === "Task Remainder") {
      setShowPopup(true); // Open the popup
      setLoading(true); // Start loading

      try {
        const coachId = "11631c17-8bc5-49f2-8a10-45238ebf5424"; // Replace with dynamic coach ID if needed
        const response = await fetch(
          `https://localhost:7046/api/Coach/gettaskbycoachid/${coachId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        console.log("API Response:", data);

        // Extract tasks from the 'data' property of the response
        if (data.status === 200 && Array.isArray(data.data)) {
          setTasks(data.data); // Store the fetched tasks
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (error) {
        console.error(error.message);
        alert("Error fetching tasks. Please try again later.");
      } finally {
        setLoading(false); // Stop loading
      }
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false); // Close the popup
  };

  const handleSendReminder = (taskId) => {
    alert(`Reminder sent for task ID: ${taskId}`);
    // Add logic here to send a reminder (e.g., call another API)
  };

  const handleSendAllReminders = () => {
    if (tasks.length === 0) {
      alert("No tasks available to send reminders.");
      return;
    }

    // Trigger reminders for all tasks
    tasks.forEach((task) => {
      handleSendReminder(task.plannedTaskId);
    });

    alert("Reminders sent for all tasks!");
  };

  return (
    <li className="huddle-item">
      <span className="huddle-text">{text}</span>
      <span
        className="huddle-notifications"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={handleBellClick}
        style={{ cursor: "pointer" }}
      >
        🔔
        {showTooltip && <span className="tooltip">Click to take action</span>}
      </span>

      {/* Popup */}
      {showPopup && (
        <>
          <div className="modal-backdrop" onClick={handleClosePopup}></div>
          <div className="popup">
            <div className="popup-header">
              <h3>Task Remainder</h3>
              <div className="popup-actions">
                 <button className="close-btn" onClick={handleClosePopup}>
                  &times;
                </button>
              </div>
            </div>
            <div className="popup-content">
            <button className="send-all-btn" onClick={handleSendAllReminders}>Send All</button>
              {loading ? (
                <p>Loading...</p>
              ) : tasks.length > 0 ? (
                <table className="datagrid">
                  <thead>
                    <tr>
                      <th>Client Name</th>
                      <th>Task Title</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((task) => (
                      <tr key={task.plannedTaskId}>
                        <td>{task.clientName}</td>
                        <td>{task.taskTitle}</td>
                        <td>
                          <button
                            className="send-reminder-btn"
                            onClick={() => handleSendReminder(task.plannedTaskId)}
                          >
                            Send Reminder
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <p>No tasks available.</p>
              )}
            </div>
          </div>
        </>
      )}
    </li>
  );
};

export default YourHuddle;