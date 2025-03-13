import React, { useState } from "react";
import "./YourHuddle.css";

const YourHuddle = () => {
  // Assign unique IDs to each huddle item
  const huddles = [
    { id: 1, name: "Task Remainder" },
    { id: 2, name: "Session Remainder" },
    { id: 3, name: "Payment Remainder" },
  ];

  return (
    <div className="your-huddle">
      <div className="header">YOUR HUDDLE</div>
      <ul className="huddle-list">
        {huddles.map((item) => (
          <HuddleItem key={item.id} item={item} />
        ))}
      </ul>
    </div>
  );
};

const HuddleItem = ({ item }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleBellClick = async () => {
    setShowPopup(true);
    setLoading(true);

    try {
      const coachId = "11631c17-8bc5-49f2-8a10-45238ebf5424";

      if (item.id === 1) {
        // Fetch tasks logic remains unchanged
        const response = await fetch(
          `https://localhost:7046/api/Coach/gettaskbycoachid/${coachId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await response.json();
        console.log("API Response (Tasks):", data);

        if (data.status === 200 && Array.isArray(data.data)) {
          setTasks(data.data);
        } else {
          throw new Error("Invalid API response format for tasks");
        }
      } else if (item.id === 2) {
        // Fetch sessions
        const response = await fetch(
          `https://localhost:7046/api/Coach/getsessionbycoachid/${coachId}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch sessions");
        }

        const data = await response.json();
        console.log("API Response (Sessions):", data);

        if (data.status === 200 && Array.isArray(data.data)) {
          setSessions(data.data);
        } else {
          throw new Error("Invalid API response format for sessions");
        }
      }
    } catch (error) {
      console.error(error.message);
      alert("Error fetching data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  const handleSendReminder = async (itemData) => {
    try {
      let payload;

      if (item.id === 1) {
        // Task reminder payload
        payload = {
          plannedSessionId: itemData.plannedSessionId,
          coachId: itemData.coachId,
          clientId: itemData.clientId,
          plannedTaskId: itemData.plannedTaskId,
          taskTitle: itemData.taskTitle,
          clientName: itemData.clientName,
          RemainderType: "Task",
        };
      } else if (item.id === 2) {
        // Session reminder payload
        payload = {
          sessionId: itemData.sessionId,
          coachId: itemData.coachId,
          clientId: itemData.clientId,
          sessionTitle: itemData.sessionTitle,
          clientName: itemData.clientName,
          RemainderType: "Session",
        };
      }

      console.log("Sending reminder payload:", payload);

      const response = await fetch("https://localhost:7046/api/Coach/sendRemainderEmail", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to send reminder");
      }

      alert(`Reminder sent successfully for ${item.name.toLowerCase()} ID: ${itemData.sessionId || itemData.plannedTaskId}`);
    } catch (error) {
      console.error(error.message);
      alert(`Error sending reminder: ${error.message}`);
    }
  };

  const handleSendAllReminders = async () => {
    const items = item.id === 1 ? tasks : sessions;

    if (items.length === 0) {
      alert(`No ${item.name.toLowerCase()} available to send reminders.`);
      return;
    }

    try {
      for (const itemData of items) {
        await handleSendReminder(itemData);
      }

      alert(`Reminders sent for all ${item.name.toLowerCase()}!`);
    } catch (error) {
      console.error(error.message);
      alert(`Error sending reminders: ${error.message}`);
    }
  };

  return (
    <li className="huddle-item">
      <span className="huddle-text">{item.name}</span>
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
              <h3>{item.name}</h3>
              <div className="popup-actions">
                <button className="send-all-btn" onClick={handleSendAllReminders}>
                  Send All
                </button>
                <button className="close-btn" onClick={handleClosePopup}>
                  &times;
                </button>
              </div>
            </div>
            <div className="popup-content">
              {loading ? (
                <p>Loading...</p>
              ) : item.id === 1 ? (
                tasks.length > 0 ? (
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
                              onClick={() => handleSendReminder(task)}
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
                )
              ) : item.id === 2 ? (
                sessions.length > 0 ? (
                  <table className="datagrid">
                    <thead>
                      <tr>
                        <th>Client Name</th>
                        <th>Session Title</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sessions.map((session) => (
                        <tr key={session.sessionId}>
                          <td>{session.clientName}</td>
                          <td>{session.sessionTitle}</td>
                          <td>
                            <button
                              className="send-reminder-btn"
                              onClick={() => handleSendReminder(session)}
                            >
                              Send Reminder
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No sessions available.</p>
                )
              ) : (
                <p>No data available.</p>
              )}
            </div>
          </div>
        </>
      )}
    </li>
  );
};

export default YourHuddle;