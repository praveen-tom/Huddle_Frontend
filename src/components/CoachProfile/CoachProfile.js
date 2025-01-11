import React, { useEffect, useState } from "react";
import './CoachProfile.css';
import { isEditable } from "@testing-library/user-event/dist/utils";

export default function CoachProfile({ isOpen, onClose }) {
    const [notification, setNotification] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [IsEditMode,setIsEditMode] = useState(false);
    const [selectedTimes, setSelectedTimes] = useState([]);

   
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("https://localhost:7046/api/CoachProfile");
                console.log(response); // Debug line
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();
                console.log("data",data); // Debug line
                setNotification(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    //Edit Profile Details
    const handleEditClick=()=>{
        setIsEditMode(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsEditMode(false); // Switch back to view mode
        // Add logic to save changes to the server if needed
        console.log("Updated data:", notification);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNotification((prev) => ({
            ...prev,
            [name]: value, // Dynamically update fields
        }));
    };

// Handle Timeslot Click
const handleTimeslotClick = (time) => {
    setSelectedTimes((prev_time) =>
        prev_time.includes(time)
            ? prev_time.filter((t) => t !== time) // Deselect if already selected
            : [...prev_time, time] // Select if not already selected

    ); 
    console.log("time",time)
    console.log("selectedtime",selectedTimes)
};

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }
//console.log("notiication",notification);
    return (
        <div className={`coachprofile-panel ${isOpen ? "open" : ""}`}>
            <div className="coachprofile-header">
                <h2>Coach Profile</h2>
                <button className="close-btn" onClick={onClose}>✖</button>
            </div>
            <div className="coachprofile-content">
                <div className="coachleft-panel">
                    <div className="profile">
                        <div className="header">PROFILE</div>
                        <div className="content">
                            <div className="empty-div"></div>
                            <div className="sub-content">
                                <img
                                    src="https://via.placeholder.com/40"
                                    alt="Profile"
                                    className="profile-picture"
                                />
                                <h1>{notification.name}</h1>
                                <button>Message</button>
                            </div>
                        </div>
                    </div>
                    <div className="payment">
                        <div className="header">PAYMENTS</div>
                    </div>
                </div>

                {/* Right Panel */}
                <div className="coachright-panel">
                    <div className="info">
                        <div className="header">INFORMATION</div>
                      
                        {IsEditMode ?(
                             // Edit Mode: Display Form
                             <form onSubmit={handleFormSubmit} className="edit-form">
                             <div>
                                 <label>Name :</label>
                                 <input
                                     type="text"
                                     name="name"
                                     value={notification.name}
                                     onChange={handleChange}
                                 />
                             </div>
                             <div>
                                 <label>Qualification :</label>
                                 <input
                                     type="text"
                                     name="qualification"
                                     value={notification.qualification}
                                     onChange={handleChange}
                                 />
                             </div>
                             <div>
                                 <label>Mobile :</label>
                                 <input
                                     type="text"
                                     name="mobile"
                                     value={notification.mobile}
                                     onChange={handleChange}
                                 />
                             </div>
                             <div>
                                 <label>Email :</label>
                                 <input
                                     type="email"
                                     name="email"
                                     value={notification.email}
                                     onChange={handleChange}
                                 />
                             </div>
                             <div>
                                 <label>Age :</label>
                                 <input
                                     type="number"
                                     name="age"
                                     value={notification.age}
                                     onChange={handleChange}
                                 />
                             </div>
                             <div className="btn-submit">
                             <button type="submit">Save</button></div>
                         </form>
                     ) : (
                        <div className="view-mode"> 
                            <div  className="edit-icon"> <a href="#" onClick={handleEditClick}><span className="">Edit</span> </a></div>
                        <ul className='noti-list'>
                        {notification ? (
                            <>
                                <li><label>Name : </label>{notification.name}</li>
                                <li><label>Qualification :</label> {notification.qualification}</li>
                                <li><label>Mobile :</label> {notification.mobile}</li>
                                <li><label>Email :</label> {notification.email}</li>
                                <li><label>Age :</label> {notification.age}</li>
                            </>
                        ) : (
                            <li>No notifications available</li>
                        )}
                        </ul>
                        </div>
                        )}
                    </div>
                    <div className="timeslots">
                        <div className="header">TIMESLOTS</div>
                        <div>
                   
                        {notification.availableTimes.map((time,index)=>(
                        <button
                        key={index}
                        className={`task-text time-slot ${
                            selectedTimes.includes(time) ? "selected" : ""
                        }`}
                        onClick={() => handleTimeslotClick(time)}
                    >
                        {time}
                    </button>
                        ))}
                         <div>
                            <h4>Selected TimeSlots</h4>
                            <span>{selectedTimes.join(",")||"None"}</span>
                        </div>
                        </div>
                       
                    </div>
                     
                </div>
            </div>
        </div>
    );
}
