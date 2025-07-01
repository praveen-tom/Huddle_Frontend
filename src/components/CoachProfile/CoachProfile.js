import React, { useEffect, useState, useContext } from "react";
import './CoachProfile.css';
import { UserContext } from "../../Context/UserContext";
import API_ENDPOINTS from "../../apiconfig";
import { authFetch } from "../../api";

export default function CoachProfile({ isOpen, onClose }) {
    const [notification, setNotification] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [IsEditMode, setIsEditMode] = useState(false);
    const [selectedTimes, setSelectedTimes] = useState([]);
    const [originalTimes, setOriginalTimes] = useState([]);
    const [defaultTimeslots, setDefaultTimeslots] = useState([]);
    const [preferredTimeslots, setPreferredTimeslots] = useState([]);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // State to control popup visibility
    const [profileImage, setProfileImage] = useState(null); // State to store uploaded image
    const { user } = useContext(UserContext);

    console.log("User context:", user);

    useEffect(() => {
        const fetchData = async () => {
            try {
                if (!user?.id) {
                    throw new Error("User ID is not available.");
                }
                const response = await authFetch(
                    `${API_ENDPOINTS.baseurl}/CoachProfile/GetCoachById/${user.id}`,
                    {},
                    user
                );
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to fetch coach data.");
                }
                const data = await response.json();
                const coachData = data.data || {};
                const timeslots = coachData.timeslots || {};

                // Set the profile image if it exists in the API response
                if (coachData.profilePic) {
                    const base64Prefix = "data:image/png;base64,";
                    const fullBase64String = coachData.profilePic.startsWith(base64Prefix)
                        ? coachData.profilePic
                        : `${base64Prefix}${coachData.profilePic}`;
                    setProfileImage(fullBase64String);
                }

                // Update other states
                setNotification(coachData);
                setDefaultTimeslots(timeslots.defaulttiming || []);
                setPreferredTimeslots(timeslots.preferredtiming || []);
                setSelectedTimes(timeslots.preferredtiming || []);
                setOriginalTimes(timeslots.preferredtiming || []);
            } catch (err) {
                setError(err.message);
                console.error("Error fetching coach data:", err);
            } finally {
                setLoading(false);
            }
        };
        if (user?.id) {
            fetchData();
        }
    }, [user]);

    const handleEditClick = () => {
        setIsEditMode(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const updatedCoachInfo = {
            Id: user?.id,
            Name: notification.name,
            Email: notification.email,
            Age: notification.age,
            qualification: notification.qualification,
            mobile: notification.mobile,
        };
        try {
            const response = await authFetch(`${API_ENDPOINTS.baseurl}/CoachProfile/UpdateCoachInfo`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(updatedCoachInfo),
            }, user);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update coach info.");
            }
            const responseData = await response.json();
            alert(responseData.message || "Coach information updated successfully!");
            setIsEditMode(false);
        } catch (error) {
            console.error("Error while updating coach info:", error);
            alert(`Failed to update coach info: ${error.message}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setNotification((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleTimeslotClick = async (time) => {
        setSelectedTimes((prevTimes) =>
            prevTimes.includes(time)
                ? prevTimes.filter((t) => t !== time)
                : [...prevTimes, time]
        );
        const payload = {
            ClientId: user?.id,
            CoachPreferredTimeslots: selectedTimes.includes(time)
                ? selectedTimes.filter(t => t !== time)
                : [...selectedTimes, time],
        };
        console.log("Payload being sent:", payload);
        try {
            const response = await authFetch(
                `${API_ENDPOINTS.baseurl}/CoachProfile/SaveTimeslots`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                },
                user
            );
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to update timeslots.");
            }
            const responseData = await response.json();
            console.log("Response from server:", responseData);
            alert("Timeslots updated successfully!");
            setOriginalTimes([...selectedTimes]);
        } catch (error) {
            console.error("Error while updating timeslots:", error);
            alert(`Failed to update timeslots: ${error.message}`);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfileImage(reader.result); // Set the base64 image URL
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProfileImage = async () => {
        try {
            if (!profileImage) {
                alert("Please select an image to upload.");
                return;
            }
    
            // Extract the Base64 string (including the prefix)
            const base64String = profileImage; // Use the full Base64 string
            if (!base64String) {
                throw new Error("Invalid Base64 string.");
            }
    
            // Prepare the payload
            const payload = {
                UserId: user?.id, // User ID
                ProfileImage: base64String, // Send the full Base64 string
            };
            console.log("Payload being sent:", payload);
    
            // Send the request to the backend
            const response = await authFetch(`${API_ENDPOINTS.baseurl}/Coach/UploadProfileImage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json", // Use JSON for sending the payload
                },
                body: JSON.stringify(payload),
            }, user);
    
            if (!response.ok) {
                let errorText;
                try {
                    const errorData = await response.json();
                    errorText = errorData.message || "Unknown error";
                } catch {
                    errorText = await response.text();
                }
                throw new Error(errorText || "Failed to upload profile image.");
            }
    
            const responseData = await response.json();
            alert(responseData.message || "Profile image updated successfully!");
            setIsPopupOpen(false); // Close the popup after saving
        } catch (error) {
            console.error("Error while uploading profile image:", error);
            alert(`Failed to upload profile image: ${error.message}`);
        }
    };

    const isModified =
        JSON.stringify(selectedTimes.sort()) !== JSON.stringify(originalTimes.sort());

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
                                    src={profileImage || "/ProfilePic/default-avatar.png"}
                                    alt="Profile"
                                    className="profile-picture"
                                    onClick={() => setIsPopupOpen(true)} // Open popup on click
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
                    </div>
                </div>
            </div>
            {/* Popup for uploading profile image */}
            {isPopupOpen && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Upload Profile Picture</h3>
                        <input type="file" accept="image/*" onChange={handleFileChange} />
                        {profileImage && (
                            <img src={profileImage} alt="Preview" className="popup-image-preview" />
                        )}
                        <div className="popup-buttons">
                            <button onClick={handleSaveProfileImage}>Upload</button>
                            <button onClick={() => setIsPopupOpen(false)}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}