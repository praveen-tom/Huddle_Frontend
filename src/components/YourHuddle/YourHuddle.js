import React, { useState } from "react";
import "./YourHuddle.css";

const YourHuddle = () => {
  const huddles = [
    "Task Remainder",
    "Session Remainder",
    "Payment Remainder",
  ];

  return (
    <div className="your-huddle">
      <div className="header">YOUR HUDDLE</div>
      <ul className="huddle-list">
        {huddles.map((item, index) => (
          <HuddleItem key={index} text={item} />
        ))}
      </ul>
    </div>
  );
};

const HuddleItem = ({ text }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <li className="huddle-item">
      <span className="huddle-text">{text}</span>
      <span 
        className="huddle-notifications"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        🔔
        {showTooltip && (
          <span className="tooltip">Click to take action</span>
        )}
      </span>
    </li>
  );
};

export default YourHuddle;