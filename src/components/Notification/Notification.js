import React from 'react';
import './Notification.css'; // Create this file for header-specific styling

export default function Notification({ isOpen, onClose }) {
  const notification = [
    { title: "Session 7 with Sarah", time: "9 am - 10 am" },
    { title: "Free", time: "10 am - 11 am" },
    { title: "Session 2 with Bella", time: "11 am - 12 pm" },
    { title: "Free", time: "12 pm - 1 pm" },
    { title: "Planning session", time: "1 pm - 2 pm" },
    { title: "Session 6 with Florence", time: "2 pm - 4 pm" },
    { title: "Free", time: "4 pm - 5 pm" },

  ];

  return (
    <div className={`notification-panel ${isOpen ? "open" : ""}`}>
      <div className="notification-header">
        <h2>Notifications</h2>
        <button className="mark-read">Mark all as read</button>
        <button className="close-btn" onClick={onClose}>✖</button>
      </div>
      <div className="notification-content">
       <ul className='noti-list'>
       {notification.map((item, index) => (
          <li key={index} className="list-item">
            <li className="title">{item.title}</li>
            <li className="time">{item.time}</li>
          </li>
        ))}
       </ul> 
      </div>
    </div>
  );
}
