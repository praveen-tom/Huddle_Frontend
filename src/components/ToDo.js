import React from "react";
import "./ToDo.css";

function ToDo() {
  const tasks = [
    "Invite new client 'Joe' to Huddle",
    "Upload session review for Bella's session",
    "Upload resource",
    "Plan Diana's upcoming session",
  ];

  return (
    <div className="component">
      <div className="header">TO DO</div>
      <ul className="list">
        {tasks.map((task, index) => (
          <li key={index} className="list-item">
            {task}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ToDo;
