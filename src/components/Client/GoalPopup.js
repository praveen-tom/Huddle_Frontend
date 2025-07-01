import React, { useState, useContext, useEffect } from "react";
import "./GoalPopup.css";
import { authFetch } from "../../api";
import { UserContext } from "../../Context/UserContext";
import API_ENDPOINTS from "../../apiconfig";

const GoalPopup = ({ onClose, onSave, profileData }) => {
  const { user } = useContext(UserContext); 
  const [goal, setGoal] = useState(""); 
  const [message, setMessage] = useState(""); 
  const [isSuccess, setIsSuccess] = useState(false); 

  
  useEffect(() => {
    console.log("Profile Datass:", profileData); 
  }, [profileData]);

  const handleSubmit = async () => {
    if (!goal.trim()) {
      alert("Please enter a goal.");
      return;
    }

   
    if (!profileData?.data?.clientId) {
      setMessage("Client ID is missing.");
      setIsSuccess(false);
      return;
    }

    
    const goalData = {
      _id: "", 
      ClientID: profileData?.data?.clientId || "", 
      Status: "Completed",  
      CreatedDate: new Date().toISOString(),  
      CreatedBy: user?.id || "", 
      ModifiedDate: null,  
      ModifiedBy: null,    
      GoalTitle: goal,  
    };

    
    console.log("goalData:", goalData);  

    try {
      
      const response = await authFetch.post(`${API_ENDPOINTS.baseurl}/Client/AddGoals`, goalData);

      
      if (response.status === 200) {
        setMessage(response.data.message || "Goal added successfully.");
        setIsSuccess(true);
        onSave(goal); 
      } else {
        setMessage(response.data.message || "Failed to add goal.");
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
              value={goal} 
              onChange={(e) => setGoal(e.target.value)} 
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
