import React, { useState } from "react";
import "./App.css";
import Sidebar from "./components/Sidebar";
import YourDay from "./components/YourDay";
import ToDo from "./components/ToDo";
import YourHuddle from "./components/YourHuddle";
import Notification from "./components/Notification";
import CoachProfile from "./components/CoachProfile";
import Calendar from "./components/Calendar";

//   const today = new Date();
//  const dayName = today.toLocaleDateString("en-US", { weekday: "long" });
export default function App() {
const [isNotificationOpen, setIsNotificationOpen] = useState(false);
const [iCoachprofileOpen,setIsCoachprofileOpen] = useState(false);
const toggleNotifications = () => {
  setIsNotificationOpen(!isNotificationOpen);
};
const toggleCoachprofile = () => {
  setIsCoachprofileOpen(!iCoachprofileOpen);
};
  return (
    <div className="app-container">
      {/* Sidebar (Constant) */}
      <div className="">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Top Panel (Header) */}
        <header className="top-panel">
          <h1>Happy Friday, Jack!</h1>
          <div className="header-badge">
            <i className="search-icon">🔍</i>
            <i className="notification-icon" onClick={toggleNotifications}
              style={{ cursor: "pointer" }}>🔔</i>
            <img
              src="https://via.placeholder.com/40"
              alt="Profile"
              className="profile-picture" onClick={toggleCoachprofile}
            />
          </div>
        </header>

        {/* Panels */}
        <div className="panels">
          {/* Left Panel */}
          <div className="left-panel">
            <YourDay />
          </div>

          {/* Right Panel */}
          <div className="right-panel">
            <ToDo />
            <YourHuddle />
          </div>
        </div>
        <div className="calendar-panel">
          {/* <label>
            CALENDAR
          </label>
          <table bgcolor="lightgrey" align="center"
        cellspacing="21" cellpadding="21">
        <thead>
            <tr>
                <th>Sun</th>
                <th>Mon</th>
                <th>Tue</th>
                <th>Wed</th>
                <th>Thu</th>
                <th>Fri</th>
                <th>sat</th>
            </tr>
        </thead>
         
        <tbody>
            <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td>1</td>
                <td>2</td>
            </tr>
            <tr></tr>
            <tr>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>7</td>
                <td>8</td>
                <td>9</td>
            </tr>
            <tr>
                <td>10</td>
                <td>11</td>
                <td>12</td>
                <td>13</td>
                <td>14</td>
                <td>15</td>
                <td>16</td>
            </tr>
            <tr>
                <td>17</td>
                <td>18</td>
                <td>19</td>
                <td>20</td>
                <td>21</td>
                <td>22</td>
                <td>23</td>
            </tr>
            <tr>
                <td>24</td>
                <td>25</td>
                <td>26</td>
                <td>27</td>
                <td>28</td>
                <td>29</td>
                <td>30</td>
            </tr>
            <tr>
                <td>31</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
            </tr>
        </tbody>
    </table> */}
    <Calendar/> 
        </div>
        <CoachProfile 
       isOpen={iCoachprofileOpen}
       onClose={toggleCoachprofile}
       />
      </div>
      <Notification
        isOpen={isNotificationOpen}
        onClose={toggleNotifications}
      />
    </div>
  );
}

