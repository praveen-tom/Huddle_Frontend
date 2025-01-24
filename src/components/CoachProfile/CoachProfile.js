import React, { useEffect, useState } from "react";
import './CoachProfile.css';

export default function CoachProfile({ isOpen, onClose }) {
    const [notification, setNotification] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [IsEditMode, setIsEditMode] = useState(false);
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [originalTimes, setOriginalTimes] = useState([]);
    const [defaultTimeslots, setDefaultTimeslots] = useState([]);
    const [preferredTimeslots, setPreferredTimeslots] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("https://localhost:7046/api/CoachProfile");
                if (!response.ok) {
                    throw new Error(`Error: ${response.status} ${response.statusText}`);
                }
                const data = await response.json();

                setNotification(data);
                setDefaultTimeslots(data.timeslots.defaulttiming || []);
                setPreferredTimeslots(data.timeslots.preferredtiming || []);
                setSelectedTimes(data.timeslots.preferredtiming || []);
                setOriginalTimes(data.timeslots.preferredtiming || []);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleEditClick = () => {
        setIsEditMode(true);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        setIsEditMode(false);
        console.log("Updated data:", notification);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNotification((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTimeslotClick = (time) => {
        setSelectedTimes((prevTimes) =>
            prevTimes.includes(time)
                ? prevTimes.filter((t) => t !== time) 
                : [...prevTimes, time] 
        );
    };

    const isModified =
        JSON.stringify(selectedTimes.sort()) !== JSON.stringify(originalTimes.sort());

        const handleSaveOrUpdate = async () => {
            try {
                const payload = {
                    ClientId: "11631c17-8bc5-49f2-8a10-45238ebf5424", // Replace with actual ClientId
                    CoachPreferredTimeslots: selectedTimes
                };
        
                console.log("Payload being sent:", payload);
        
                const response = await fetch(
                    "https://localhost:7046/api/CoachProfile/SaveTimeslots",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(payload),
                    }
                );
        
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error("Server error:", errorData);
                    alert(`Failed to update timeslots: ${errorData.message || "Unknown error"}`);
                    return;
                }
        
                const responseData = await response.json();
                console.log("Response from server:", responseData);
        
                alert("Timeslots updated successfully!");
                setOriginalTimes([...selectedTimes]); // Update the original times to reflect the saved changes
            } catch (error) {
                console.error("Error while updating timeslots:", error);
                alert(`Failed to update timeslots: ${error.message}`);
            }
        };
        

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className={`coachprofile-panel ${isOpen ? "open" : ""}`}>
            <div className="coachprofile-header">
                <h2>Coach Profile</h2>
                <button className="close-btn" onClick={onClose}>
                    ✖
                </button>
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

                <div className="coachright-panel">
                    <div className="info">
                        <div className="header">INFORMATION</div>
                        {IsEditMode ? (
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
                                    <button type="submit">Save</button>
                                </div>
                            </form>
                        ) : (
                            <div className="view-mode">
                                <div className="edit-icon">
                                    <a href="#" onClick={handleEditClick}>
                                        <span>Edit</span>
                                    </a>
                                </div>
                                <ul className="noti-list">
                                    {notification ? (
                                        <>
                                            <li>
                                                <label>Name : </label>
                                                {notification.name}
                                            </li>
                                            <li>
                                                <label>Qualification :</label>{" "}
                                                {notification.qualification}
                                            </li>
                                            <li>
                                                <label>Mobile :</label>{" "}
                                                {notification.mobile}
                                            </li>
                                            <li>
                                                <label>Email :</label>{" "}
                                                {notification.email}
                                            </li>
                                            <li>
                                                <label>Age :</label> {notification.age}
                                            </li>
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
                        <h4>Available Timeslots</h4>
                        {defaultTimeslots.map((time, index) => (
                            <button
                                key={index}
                                className={`task-text time-slot ${
                                    selectedTimes.includes(time) ? "preferred" : ""
                                }`}
                                onClick={() => handleTimeslotClick(time)}
                            >
                                {time}
                            </button>
                        ))}
                        </div>

                        <div>
                            <h4>Selected Timeslots</h4>
                            <span>{selectedTimes.join(", ") || "None"}</span>
                        </div>

                        <div className="btn-save-update">
                            <button onClick={handleSaveOrUpdate}>
                                {isModified ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
