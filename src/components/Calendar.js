import React, { useState } from "react";
import FullCalendar from "@fullcalendar/react"; // FullCalendar
import dayGridPlugin from "@fullcalendar/daygrid"; // For Month view
import timeGridPlugin from "@fullcalendar/timegrid"; // For Week/Day views
import interactionPlugin from "@fullcalendar/interaction"; // For user interactions
import "./Calendar.css"; // Import custom styles
 
const Calendar = () => {
  const [events, setEvents] = useState([
    {
      id: "1",
      title: "Session with Harry",
      start: "2024-11-05T08:00:00",
      end: "2024-11-05T09:00:00",
      color: "#4A90E2", // Blue
    },
    {
      id: "2",
      title: "Session with Laura",
      start: "2024-11-25T08:00:00",
      end: "2024-11-25T09:00:00",
      color: "#8E44AD", // Purple
    },
    {
      id: "3",
      title: "Session with Adam",
      start: "2024-11-06T09:00:00",
      end: "2024-11-25T10:00:00",
      color: "#E67E22", // Orange
    },
    {
      id: "4",
      title: "Planning session",
      start: "2024-11-06T10:00:00",
      end: "2024-11-25T11:00:00",
      color: "#E74C3C", // Red
    },
    {
      id: "5",
      title: "Session with Sam",
      start: "2024-11-07T10:00:00",
      end: "2024-11-25T11:00:00",
      color: "#9B59B6", // Purple
    },
  ]);
 
  const handleDateSelect = (selectInfo) => {
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
  };
 
  const handleEventClick = (clickInfo) => {
    if (window.confirm(`Are you sure you want to delete '${clickInfo.event.title}'?`)) {
      clickInfo.event.remove();
    }
  };
 
  return (
<div className="calendar-layout">
<div className="calendar-header-left">Calendar</div>
<div className="calendar-main">
<FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: "dayGridMonth,timeGridWeek,timeGridDay",
            center: "title",
            right: "prev,next today",
          }}
          initialView="timeGridWeek"
          editable
          selectable
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          slotDuration="01:00:00" // Set the grid to 1-hour intervals
          slotLabelInterval="01:00:00" // Labels at 1-hour intervals
        />
</div>
</div>
  );
};
 
export default Calendar;