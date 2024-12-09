import React from "react";
import './CoachProfile.css'; 
import { height } from "@fortawesome/free-solid-svg-icons/fa0";


export default function CoachProfile({ isOpen, onClose }) {
    const notification = [
      { title: "Name", time: "coach" },
      { title: "Qualifaction", time: "ICF" },
      { title: "Mobile", time: "1234567" },
      { title: "Email", time: "123@adc.com" },
      { title: "Age", time: "30" },
      { title: "Status", time: "Active" },
  
    ];
    const time = [{availabletime:["08:00","09:00","10:00","11:00","12:00"]}];
  
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
            <h1>Name</h1>
            <button>Message</button>
            </div>
            <div></div>
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
           <ul className='noti-list'>
         {notification.map((item, index) => (
            <li key={index} className="list-item">
              <li className="title">{item.title} : {item.time}</li>
            </li>
          ))}
         </ul> 
           </div>
           <div className="timeslots">
           <div className="header">TIMESLOTS</div>
           <div>
          {/* {time.map((item)=>(


          ))} */}
            </div>
           </div>
          </div>
        </div>
      </div>
    );
  }