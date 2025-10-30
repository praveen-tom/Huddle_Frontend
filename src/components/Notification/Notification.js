import React, { useContext, useEffect, useState } from "react";
import "./Notification.css";
import axios from "axios";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { UserContext } from "../../Context/UserContext";
import { Icon } from "@iconify/react";
import API_ENDPOINTS from "../../apiconfig";

export default function Notification({ isOpen, onClose }) {
  const [notifications, setNotifications] = useState([]);
  const { user, Notification } = useContext(UserContext);
  const CoachId = user.id;

  useEffect(() => {
    let connection;

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `${API_ENDPOINTS.baseurl}/Notification/${CoachId}`
        );
        const notifications = response.data;

          // const notifications = response.data.filter(
          // (notif) => notif.isRead === false);

        // Fetch client details for each notification
        const notificationsWithClient = await Promise.all(
          notifications.map(async (notif) => {
            if (notif.clientID) {
              try {
                const clientRes = await fetch(
                  `${API_ENDPOINTS.baseurl}/Client/GetClientProfileforCoach/${notif.clientID}`
                );
                if (clientRes.ok) {
                  const clientData = await clientRes.json();
                  return {
                    ...notif,
                    clientName: clientData.data.name,
                    clientprofile: clientData.data.profilePic,
                  };
                }
              } catch (e) {
                // fallback if client fetch fails
              }
            }
            return { ...notif, clientName: "Unknown", clientprofile: null };
          })
        );

        setNotifications(notificationsWithClient);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    const setupSignalRConnection = async () => {
      try {
        connection = new HubConnectionBuilder()
          .withUrl(`${API_ENDPOINTS.url}/notificationHub?CoachId=${CoachId}`, {
            withCredentials: true,
          })
          .configureLogging("debug")
          .withAutomaticReconnect()
          .build();
        connection.on("ReceiveNotification", (newNotification) => {
          setNotifications((prev) => [...prev, newNotification]);
        });

        await connection.start();
      } catch (error) {
        console.error("Error establishing SignalR connection:", error);
      }
    };

    fetchNotifications();
    setupSignalRConnection();

    return () => {
      if (connection) {
        connection.off("ReceiveNotification");
        connection.stop();
      }
    };
  }, [CoachId]);

  // Group notifications by date
  function groupNotificationsByDate(notifications) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  // Start of last week (previous Sunday)
  const startOfLastWeek = new Date(startOfWeek);
  startOfLastWeek.setDate(startOfWeek.getDate() - 7);

  // End of last week (last Saturday)
  const endOfLastWeek = new Date(startOfWeek);
  endOfLastWeek.setDate(startOfWeek.getDate() - 1);
  endOfLastWeek.setHours(23, 59, 59, 999);

  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  const groups = {
    today: [],
    thisWeek: [],
    lastweek: [],
    thisMonth: [],
    earlier: [],
  };

  notifications.forEach((notif) => {
    const created = new Date(notif.createdAt);
    if (created >= startOfToday) {
      groups.today.push(notif);
    } else if (created >= startOfWeek) {
      groups.thisWeek.push(notif);
    } else if (created >= startOfLastWeek && created <= endOfLastWeek) {
      groups.lastweek.push(notif);
    } else if (created >= startOfMonth) {
      groups.thisMonth.push(notif);
    } else {
      groups.earlier.push(notif);
    }
  });

  return groups;
}

  const MAX_NOTIFICATIONS = 50;
  const displayedNotifications = notifications.slice(-MAX_NOTIFICATIONS);
  console.log("Displayed Notifications:", displayedNotifications);
  const unreadCount = notifications.filter((notif) => !notif.isRead).length;

  useEffect(() => {
    Notification(unreadCount);
  }, [unreadCount, Notification]);

  const sortedNotifications = [...displayedNotifications]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  const grouped = groupNotificationsByDate(sortedNotifications);

  const markAllAsRead = async () => {
    try {
      await fetch(`${API_ENDPOINTS.baseurl}/Notification/mark-all-read?id=${CoachId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await fetch(`${API_ENDPOINTS.baseurl}/Notification/markasread?id=${notificationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  function renderNotificationItem(item, index) {
    return (
      <li key={item.id || index} className={`list-item${item.isRead ? " read" : ""}`}>
        <div className="notification-title">
          <div className="client-profileicon">
            {item.clientprofile ? (
              <img
                src={
                  item.clientprofile.startsWith("data:image")
                    ? item.clientprofile
                    : `data:image/png;base64,${item.clientprofile}`
                }
                alt={item.clientName || "Client"}
                style={{ width: "60px", height: "60px", borderRadius: "50%" }}
              />
            ) : (
              <Icon icon="codicon:account" style={{ color: "#1a274f", fontSize: "4.0rem", cursor: "pointer", width: "100%" }} />
            )}
          </div>
          <div className="message-content">
            <div className="message-content-clientname">{item.clientName}</div>
            <div className="message-content-clientmessage">{item.message}</div>
            
          </div>
          <div className="mark-as-read-icon">
            <Icon icon="mdi:tick-outline" width="24" height="24" onClick={() => markAsRead(item.id)} />
          </div>
        </div>
        <div className="time">
          {item.createdAt
            ? new Date(item.createdAt).toLocaleString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Just now"}
        </div>
      </li>
    );
  }

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
        <ul className="noti-list-panel">
          {grouped.today.length > 0 && (
            <>
              <li className="noti-group-label">Today</li>
              {grouped.today.map((item, index) => renderNotificationItem(item, index))}
            </>
          )}
          {grouped.thisWeek.length > 0 && (
            <>
              <li className="noti-group-label">This Week</li>
              {grouped.thisWeek.map((item, index) => renderNotificationItem(item, index))}
            </>
          )}
          {grouped.lastweek.length > 0 && (
           <>
              <li className="noti-group-label">Last Week</li>
              {grouped.lastweek.map((item, index) => renderNotificationItem(item, index))}
            </>
          )}
          {grouped.thisMonth.length > 0 && (
            <>
              <li className="noti-group-label">This Month</li>
              {grouped.thisMonth.map((item, index) => renderNotificationItem(item, index))}
            </>
          )}
          {grouped.earlier.length > 0 && (
            <>
              <li className="noti-group-label">Earlier</li>
              {grouped.earlier.map((item, index) => renderNotificationItem(item, index))}
            </>
          )}
        </ul>
      </div>
    </div>
  );
}