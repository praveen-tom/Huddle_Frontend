import React, { useState } from "react";
import "./Sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faColumns, faUserFriends, faComments, faBook, faBars } from "@fortawesome/free-solid-svg-icons";

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      <div className="menu-header">
        <div className="toggle-button" onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </div>
      </div>
      <div className="menu">
        <div className="menu-item">
          <FontAwesomeIcon icon={faColumns} />
          {!isCollapsed && <span>Daily Huddle</span>}
        </div>
        <div className="menu-item">
          <FontAwesomeIcon icon={faUserFriends} />
          {!isCollapsed && <span>My Huddle</span>}
        </div>
        <div className="menu-item">
          <FontAwesomeIcon icon={faComments} />
          {!isCollapsed && <span>Chats</span>}
        </div>
        <div className="menu-item">
          <FontAwesomeIcon icon={faBook} />
          {!isCollapsed && <span>The Huddle Heap</span>}
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
