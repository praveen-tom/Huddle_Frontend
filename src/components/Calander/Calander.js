import React, { useState, useEffect, useContext } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { UserContext } from "../../Context/UserContext";
import "./Calendar.css";

ChartJS.register(ArcElement, Tooltip, Legend);

const Calendar = () => {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
  
    fetch(`https://localhost:7046/api/SessionScheduling/CoachId?coachid=${user.id}`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        return response.json();
      })
      .then(data => {
        const eventsArray = Array.isArray(data) 
          ? data 
          : (data?.events || data?.data || [data]); 
  
        console.log("Raw API Response:", eventsArray);
        
        const formattedEvents = eventsArray.map(event => ({
          id: event.id?.toString() || Math.random().toString(36).substr(2, 9), 
          title: event.title || `Session with ${event.clientName || 'Client'}`,
          start: event.startDateTime || event.start, 
          end: event.endDateTime || event.end,
          color: "#4A90E2",
          tag: event.tag || ""
        }));
  
        console.log("Formatted Events:", formattedEvents);
        setEvents(formattedEvents);
      })
      .catch(error => {
        console.error("Error fetching sessions:", error);
        setEvents([]); // Clear events on error
      });
  }, [user.id]);

  const calculateHours = () => {
    const hoursByTag = {
      Session: 0,
      Planning: 0,
      Others: 0,
      Personal: 0,
      Remaining: 0,
    };

    const totalDayHours = 24;

    events.forEach((event) => {
      const duration =
        (new Date(event.end).getTime() - new Date(event.start).getTime()) /
        (1000 * 60 * 60);
      const roundedDuration = Math.ceil(duration);

      if (event.tag) {
        hoursByTag[event.tag] =
          (hoursByTag[event.tag] || 0) + roundedDuration;
      } else {
        hoursByTag.Personal += roundedDuration; 
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
          customButtons={{
            mycustombutton: {
              text: showChart ? "Back to Calendar" : "Insight",
              click: function () {
                toggleChart();
              },
            },
          }}
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
            height: "40%",
            background: "none",
            boxShadow: "none",
            transition: "width 0.3s ease",
          }}
        >
          <Doughnut data={chartData} options={chartOptions} />
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
