import React from "react";
import "./YourDay.css";

function YourDay() {
  const schedule = [
    { title: "Session 7 with Sarah", time: "9 am - 10 am" },
    { title: "Free", time: "10 am - 11 am" },
    { title: "Session 2 with Bella", time: "11 am - 12 pm" },
    { title: "Free", time: "12 pm - 1 pm" },
    { title: "Planning session", time: "1 pm - 2 pm" },
    { title: "Session 6 with Florence", time: "2 pm - 4 pm" },
    { title: "Free", time: "4 pm - 5 pm" },
    { title: "Session 6 with Florence", time: "2 pm - 4 pm" },
    { title: "Free", time: "4 pm - 5 pm" },
    { title: "Session 6 with Florence", time: "2 pm - 4 pm" },
    { title: "Free", time: "4 pm - 5 pm" },
    { title: "Session 6 with Florence", time: "2 pm - 4 pm" },
    { title: "Free", time: "4 pm - 5 pm" },
    
  ];

  return (
    <div className="your-day">
      <div className="header left"><span className="text-span">YOUR DAY</span></div>
      <ul className="list">
        {schedule.map((item, index) => (
          <li key={index} className="list-item">
            <div className="title">{item.title}</div>
            <div className="time">{item.time}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default YourDay;
