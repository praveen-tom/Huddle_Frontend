import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Doughnut } from "react-chartjs-2";
import "./Calendar.css";
 
const Calendar = () => {
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Session with Harry",
      start: "2024-12-08T08:00:00",
      end: "2024-12-08T09:00:00",
      color: "#4A90E2",
      tag: "Session",
    },
    {
      id: "2",
      title: "Session with Laura",
      start: "2024-12-08T11:00:00",
      end: "2024-12-08T12:00:00",
      color: "#4A90E2",
      tag: "Session",
    },
    {
      id: "3",
      title: "planning with Adam",
      start: "2024-12-09T09:00:00",
      end: "2024-12-09T10:00:00",
      color: "#E67E22",
      tag: "Session",
    },
    {
      id: "4",
      title: "Session with Adam",
      start: "2024-12-09T10:00:00",
      end: "2024-12-09T11:00:00",
      color: "#4A90E2",
      tag: "Session",
    },
    {
      id: "5",
      title: "Session with Sam",
      start: "2024-12-10T10:00:00",
      end: "2024-12-10T11:00:00",
      color: "#4A90E2",
      tag: "",
    },
    {
      id: "6",
      title: "Session with Sam",
      start: "2024-12-11T10:00:00",
      end: "2024-12-11T11:00:00",
      color: "#4A90E2",
      tag: "",
    },
    {
      id: "6",
      title: "Session with Sam",
      start: "2024-12-12T10:00:00",
      end: "2024-12-12T11:00:00",
      color: "#4A90E2",
      tag: "",
    },
    {
      id: "6",
      title: "Session with Sam",
      start: "2024-12-13T10:00:00",
      end: "2024-12-13T11:00:00",
      color: "#4A90E2",
      tag: "",
    },
  ]);

 
  const [showChart, setShowChart] = useState(false);
 
  const calculateHours = () => {
    const hoursByTag = {
      Session: 0,
      Planning: 0,
      Others: 0,
      Personal: 0,
      Remaining: 0,
    };
 
    const totalDayHours = 24;
 
    // Sum up hours for each category
    events.forEach((event) => {
      const duration =
        (new Date(event.end).getTime() - new Date(event.start).getTime()) /
        (1000 * 60 * 60);
      const roundedDuration = Math.ceil(duration);
 
      if (event.tag) {
        hoursByTag[event.tag] =
          (hoursByTag[event.tag] || 0) + roundedDuration;
      } else {
        hoursByTag.Personal += roundedDuration; // Treat untagged as "Personal"
      }
    });
 
    // Calculate remaining hours
    const totalLoggedHours =
      hoursByTag.Session +
      hoursByTag.Planning +
      hoursByTag.Others +
      hoursByTag.Personal;
 
    hoursByTag.Remaining = Math.max(0, totalDayHours - totalLoggedHours);
 
    return hoursByTag;
  };
 
  const chartData = {
    labels: events.map((event) => event.title),
    datasets: [
      {
        label: "Event Duration (Hours)",
        data: events.map(
          (event) =>
            (new Date(event.end).getTime() - new Date(event.start).getTime()) /
            (1000 * 60 * 60)
        ),
        backgroundColor: events.map((event) => event.color),
        hoverOffset: 4,
      },
    ],
  };
 
  const chartOptions = {
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Time Breakdown",
        font: {
          size: 20,
        },
        padding: {
          top: 20,
          bottom: 20,
        },
      },
    },
    maintainAspectRatio: false,
  };
 
  const toggleChart = () => setShowChart((prev) => !prev);
 
  const hoursByTag = calculateHours();
 
  return (
    <div className="calendar-layout">
        <div className="calendar-header-left">Calendar</div>
     
      <div
        className="calendar-main"
        style={{
          transition: "width 0.3s ease",
        }}
      >
        <FullCalendar
          customButtons={
            {
              mycustombutton:{
              text: showChart ? "Back to Calendar" : "Insight",
              click:function(){
                toggleChart();
              }
            }
            }
          }
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
         
          headerToolbar={{
            left: "today,mycustombutton",
            center: "title",
            right: "prev,next dayGridMonth,timeGridWeek,timeGridDay",
          }}
          initialView="timeGridWeek"
          editable
          selectable
          events={events}
          select={(selectInfo) => {
            const title = prompt("Enter a title for your event:");
            if (title) {
              const calendarApi = selectInfo.view.calendar;
              calendarApi.unselect();
 
              const newEvent = {
                id: String(events.length + 1),
                title,
                start: selectInfo.startStr,
                end: selectInfo.endStr,
                color: "#3498DB",
              };
 
              setEvents([...events, newEvent]);
            }
          }}
          eventClick={(clickInfo) => {
            if (
              window.confirm(
                `Are you sure you want to delete '${clickInfo.event.title}'?`
              )
            ) {
              clickInfo.event.remove();
            }
          }}
          slotDuration="01:00:00"
          slotLabelInterval="01:00:00"
        />
       
      </div>
      {showChart && (
  <div
    className="chart-container"
    style={{
      width: "10%",
      height:"40%",
      background:"none",
      boxShadow:"none",
      transition: "width 0.3s ease",
    }}
  >
    <Doughnut data={chartData} options={chartOptions}
    />
    <div className="hours-summary">
      <ul>
        <li>Session: {hoursByTag.Session} hours</li>
        <li>Planning: {hoursByTag.Planning} hours</li>
        <li>Others: {hoursByTag.Others} hours</li>
        <li>Personal: {hoursByTag.Personal} hours</li>
        <li>Remaining: {hoursByTag.Remaining} hours</li>
      </ul>
    </div>
  </div>
)}
 
    </div>
  );
};
 
export default Calendar;