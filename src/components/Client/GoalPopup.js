import React, { useState, useContext, useEffect } from "react";
import "./GoalPopup.css";
import { UserContext } from "../../Context/UserContext";

const GoalPopup = ({ onClose, onSave, profileData }) => {
  const { user } = useContext(UserContext); // Get current user's ID from context
  const [goal, setGoal] = useState(""); // Store the input goal
  const [message, setMessage] = useState(""); // Message to display the result of the action
  const [isSuccess, setIsSuccess] = useState(false); // Success or failure status

  // Check if profileData is loaded correctly
  useEffect(() => {
    console.log("Profile Data:", profileData); // Log profile data for debugging
  }, [profileData]);

  const handleSubmit = async () => {
    // Check if goal is entered
    if (!goal.trim()) {
      alert("Please enter a goal.");
      return;
    }

    // Ensure profileData contains ClientId
    if (!profileData?.clientId) {
      setMessage("Client ID is missing.");
      setIsSuccess(false);
      return;
    }

    // Prepare the data to send to the backend
    const goalData = {
      _id: "", 
      ClientID: profileData.clientId, // Use the clientId from profileData
      Status: "Completed",  // Set status to Completed (you can change this as needed)
      CreatedDate: new Date().toISOString(),  // Set current date as the created date
      CreatedBy: user?.id || "", // Set the user ID from the context (if available)
      ModifiedDate: null,  // You can update these fields as needed
      ModifiedBy: null,    
      GoalTitle: goal,  // The goal text entered by the user will be passed here
    };

    // Log the goalData for debugging purposes
    console.log("goalData:", goalData);  // Log the data to make sure it's correct

    try {
      // Send the data to the backend API via a POST request
      const response = await fetch("https://localhost:7046/api/Client/AddGoals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goalData),  // Send the data as JSON
      });

      const result = await response.json();

      // Handle the response
      if (response.ok) {
        setMessage(result.message || "Goal added successfully.");
        setIsSuccess(true);
        onSave(goal); // Update the parent component (UI) with the new goal
      } else {
        setMessage(result.message || "Failed to add goal.");
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("Error adding goal. Please try again.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h3>Add Goal</h3>
        {message ? (
          <>
            <p className={isSuccess ? "success-message" : "error-message"}>{message}</p>
            <button className="close-btn" onClick={onClose}>Close</button>
          </>
        ) : (
          <>
            <textarea
              placeholder="Enter goal"
              className="goal-input"
              value={goal} // The value of the textarea is bound to the goal state
              onChange={(e) => setGoal(e.target.value)} // Update the goal state as the user types
            />
            <button className="send-btn" onClick={handleSubmit}>Save</button>
            <button className="close-btn" onClick={onClose}>Close</button>
          </>
        )}
      </div>
    </div>
  );
};

export default GoalPopup;
