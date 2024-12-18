import React from "react";
import "./YourHuddle.css";

const YourHuddle = () => {
  const huddles = [
    "Joe Jackson has not completed 1 task",
    "Florence Jones has not paid for Session 3",
    "Adam Smith has not scheduled his session",
    "Sam Styles has not completed 1 task",
    "Florence Jones has not paid for Session 3",
    "Adam Smith has not scheduled his session",
    "Sam Styles has not completed 1 task",
    "Florence Jones has not paid for Session 3",
    "Adam Smith has not scheduled his session",
    "Sam Styles has not completed 1 task",
    "Florence Jones has not paid for Session 3",
    "Adam Smith has not scheduled his session",
    "Sam Styles has not completed 1 task",
  ];

  return (
    <div className="your-huddle">
      <div className="header">YOUR HUDDLE</div>
      <ul className="huddle-list">
        {huddles.map((item, index) => (
          <li key={index} className="huddle-item">
            <span className="huddle-icon">✔️</span>
            <span className="huddle-text">{item}</span>
            <span className="huddle-delete">❌</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default YourHuddle;