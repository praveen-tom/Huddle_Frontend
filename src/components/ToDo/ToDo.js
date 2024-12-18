import React from "react";
import "./ToDo.css";

function ToDo() {
  const tasks = [
    "Invite new client 'Joe' to Huddle",
    "Upload session review for Bella's session",
    "Upload resource",
    "Plan Diana's upcoming session",
    "Upload session review for Bella's session",
    "Upload resource",
    "Plan Diana's upcoming session",
    "Upload session review for Bella's session",
    "Upload resource",
    "Plan Diana's upcoming session",
    "Upload session review for Bella's session",
    "Upload resource",
    "Plan Diana's upcoming session",
  ];

  return (
    <div className="to-do">
      <div className="header">TO DO</div>
      <ul className="task-list">
        {tasks.map((task, index) => (
          <li key={index} className="task-item">
            <span className="task-icon">📄</span>
            <span className="task-text">{task}</span>
            <span className="task-delete">❌</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ToDo;
