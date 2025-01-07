import React, { useEffect, useState } from "react";
import "./Notification.css"; // Ensure this file exists for styling
import axios from "axios";
import { HubConnectionBuilder } from "@microsoft/signalr";

export default function Notification({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const [hubConnection, setHubConnection] = useState(null);
  const userId = "123";  // Hardcoded user ID

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!userId) return; 

      try {
        const response = await axios.get(
          `https://localhost:7046/api/Notification/${userId}`
        );
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    const setupSignalRConnection = async () => {
      try {
        const connection = new HubConnectionBuilder()
          .withUrl("https://localhost:7046/notificationHub", {
            withCredentials: true, 
          })
          .withAutomaticReconnect()
          .build();

        connection.on("ReceiveNotification", (notification) => {
          setNotifications((prev) => [...prev, notification]);
        });

        await connection.start();
        console.log("SignalR connection established");
        setHubConnection(connection);
      } catch (error) {
        console.error("Error establishing SignalR connection:", error);
      }
    };

    fetchNotifications();
    setupSignalRConnection();

    
    return () => {
      if (hubConnection) {
        hubConnection.stop().then(() => {
          console.log("SignalR connection stopped");
        });
      }
    };
  }, [userId, hubConnection]);

  const markAllAsRead = async () => {
    try {
      await axios.post(`https://localhost:7046/api/Notification/mark-all-read`, {
        userId,
      });

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

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
          {notifications.map((item, index) => (
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
