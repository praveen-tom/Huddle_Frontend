import React, {useContext, useEffect, useState } from "react";
import "./Notification.css";
import axios from "axios";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { UserContext } from "../../Context/UserContext";
 
export default function Notification({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const{user} = useContext(UserContext);
  const CoachId = user.id
  console.log("CoachId",CoachId);
  const {Notification} = useContext(UserContext);
  useEffect(() => {
    let connection;
 
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `https://huddleapi-production.up.railway.app/api/Notification/${CoachId}`
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
 
    const setupSignalRConnection = async () => {
      try {
        connection = new HubConnectionBuilder()
.withUrl(`https://huddleapi-production.up.railway.app/notificationHub?CoachId=${CoachId}`, {
            withCredentials: true,
          })
          .configureLogging("debug") 
          .withAutomaticReconnect() 
          .build();
 
        
        connection.on("ReceiveNotification", (newNotification) => {
          console.log("New notification received:", newNotification);
          setNotifications((prev) => [...prev, newNotification]); 
        });
 
        
        await connection.start();
        console.log("SignalR connection established");
      } catch (error) {
        console.error("Error establishing SignalR connection:", error);
      }
    };
    fetchNotifications();
    setupSignalRConnection();
 
    
    return () => {
      if (connection) {
        connection.off("ReceiveNotification"); 
        connection.stop().then(() => console.log("SignalR connection stopped"));
      }
    };
  }, [CoachId]);
 
  const markAllAsRead = async () => {
    try {
      
await fetch(`https://localhost:7046/api/Notification/mark-all-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(CoachId),
      });
 
      
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };
 
  const MAX_NOTIFICATIONS = 50;
  const displayedNotifications = notifications.slice(-MAX_NOTIFICATIONS);
  const unreadCount = notifications.filter((notif) => !notif.isRead).length;
  console.log("notification count",unreadCount,user.id);
  useEffect(() => {
    Notification(unreadCount);
  }, [unreadCount]); 
  return (
    <div className={`notification-panel ${isOpen ? "open" : ""}`}>
      <div className="notification-header">
        <h2>Notifications</h2>
        <button className="mark-read" onClick={markAllAsRead}>
          Mark all as read
        </button>
        <button className="close-btn" onClick={onClose}>
          ✖
        </button>
      </div>
      <div className="notification-content">
        <ul className="noti-list">
          {displayedNotifications.map((item, index) => (
            <li key={index} className={`list-item ${item.isRead ? "read" : ""}`}>
              <div className="title">{item.message}</div>
              <div className="time">
                {item.createdAt
                  ? new Date(item.createdAt).toLocaleString()
                  : "Just now"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}