import React, { useEffect, useState } from "react";
import "./Notification.css";
import axios from "axios";
import { HubConnectionBuilder } from "@microsoft/signalr";

export default function Notification({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const userId = "123"; // Hardcoded user ID

  useEffect(() => {
    let connection;

    const fetchNotifications = async () => {
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
        connection = new HubConnectionBuilder()
        .withUrl(`https://localhost:7046/notificationHub?userId=${userId}`, {
          withCredentials: true,
        })
          .configureLogging("debug") // Enable detailed SignalR logs
          .withAutomaticReconnect()
          .build();

          // Log connection lifecycle events
          connection.onclose(() => console.log("SignalR connection closed."));
          connection.onreconnecting(() => console.log("SignalR reconnecting..."));
          connection.onreconnected(() => console.log("SignalR reconnected."));

        // Listen for notifications
        connection.on("ReceiveNotification", (newNotification) => {
          console.log("New notification received:", newNotification);
          setNotifications((prev) => [...prev, ...newNotification]);
        });

        await connection.start();
        console.log("SignalR connection established");
      } catch (error) {
        console.error("Error establishing SignalR connection:", error);
      }
    };

    fetchNotifications();
    setupSignalRConnection();

    // Cleanup function to stop the SignalR connection
    return () => {
      if (connection) {
        connection.off("ReceiveNotification"); // Remove the listener
        connection.stop().then(() => console.log("SignalR connection stopped"));
      }
    };
  }, [userId]);

  const markAllAsRead = async () => {
    try {
      await axios.post(`https://localhost:7046/api/Notification/mark-all-read`, `"${userId}"`, {
        headers: { "Content-Type": "application/json" }, // Explicitly set the header
      });

      // Update all notifications as read in the UI
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
  return (
    <div className={`notification-panel ${isOpen ? "open" : ""}`}>
      <div className="notification-badge">{unreadCount}</div>
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
