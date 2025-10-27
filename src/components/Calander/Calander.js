import React, { useState, useEffect, useContext } from "react";
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import addMinutes from 'date-fns/addMinutes';
import { format as formatDateFns } from 'date-fns';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { UserContext } from "../../Context/UserContext";
import "./Calendar.css";
import API_ENDPOINTS from "../../apiconfig";

const sniffMimeTypeFromBase64 = (base64Value) => {
  if (!base64Value) return "image/png";
  const trimmed = `${base64Value}`.trim();
  if (trimmed.startsWith("iVBOR")) return "image/png";
  if (trimmed.startsWith("/9j")) return "image/jpeg";
  if (trimmed.startsWith("R0lGOD")) return "image/gif";
  return "image/png";
};

const normalizeProfileImageSrc = (rawValue, mimeTypeHint) => {
  if (!rawValue) return null;
  const serialized = `${rawValue}`.trim();
  if (!serialized) return null;

  if (/^data:/i.test(serialized) || /^https?:\/\//i.test(serialized)) {
    return serialized;
  }

  const hintedMime = mimeTypeHint ? `${mimeTypeHint}`.trim().toLowerCase() : "";
  const inferredMime = sniffMimeTypeFromBase64(serialized);
  const candidateMime = hintedMime || inferredMime;
  const safeMime = candidateMime.startsWith("image/")
    ? candidateMime
    : `image/${candidateMime.replace(/[^a-z0-9+.-]/g, "") || "png"}`;

  return `data:${safeMime};base64,${serialized}`;
};

ChartJS.register(ArcElement, Tooltip, Legend);

const locales = {
  'en-US': require('date-fns/locale/en-US'),
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const defaultAvatar = "/ProfilePic/default-avatar.png";

const Calendar = () => {
  const { user } = useContext(UserContext);
  const [events, setEvents] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEventInfo, setNewEventInfo] = useState({ title: "", start: null, end: null, tag: "Planning" });
  const [manualStartTime, setManualStartTime] = useState("05:00");
  const [manualEndTime, setManualEndTime] = useState("06:00");
  const [currentView, setCurrentView] = useState('week');
  const [isSavingEvent, setIsSavingEvent] = useState(false);
  const [eventError, setEventError] = useState("");

  const deriveCoachId = () => {
    return (
      user?.coachId ||
      user?.id ||
      user?.ClientId ||
      user?.clientId ||
      user?.coachID ||
      user?.clientlist?.[0]?.coachId ||
      null
    );
  };

  const buildEventPayload = ({ title, start, end, tag }) => {
    const coachId = deriveCoachId();
    if (!coachId) {
      throw new Error("Coach identifier unavailable. Please re-authenticate.");
    }

    if (!title?.trim()) {
      throw new Error("Title is required.");
    }

    if (!start || !end) {
      throw new Error("Start and end times are required.");
    }

    const startDate = new Date(start);
    const endDate = new Date(end);

    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
      throw new Error("Invalid start or end date.");
    }

    if (endDate <= startDate) {
      throw new Error("End time must be after start time.");
    }

    const formatForApi = (date) => formatDateFns(date, "ddMMyyyy HHmm");

    return {
      CoachId: coachId,
      Title: title.trim(),
      Start: formatForApi(startDate),
      End: formatForApi(endDate),
      Tag: tag || "Planning",
      ClientName: undefined,
      ProfileImage: undefined,
    };
  };

  const saveEventToServer = async (payload) => {
    const response = await fetch(`${API_ENDPOINTS.baseurl}/Coach/addcoachcalendardata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(details || 'Failed to create calendar event.');
    }

    return response.json().catch(() => null);
  };
  const calendarMinTime = React.useMemo(() => {
    const start = new Date();
    start.setHours(5, 0, 0, 0);
    return start;
  }, []);

  const calendarMaxTime = React.useMemo(() => {
    const end = new Date();
    end.setHours(17, 0, 0, 0);
    return end;
  }, []);

  const calendarHeight = React.useMemo(
    () => (currentView === 'month' ? 600 : 880),
    [currentView]
  );

  useEffect(() => {
    const coachIdentifier = deriveCoachId();
    if (!coachIdentifier) {
      console.warn("Unable to determine coach identifier for calendar events");
      return;
    }

    fetch(`${API_ENDPOINTS.baseurl}/SessionScheduling/CoachId?coachid=${coachIdentifier}`)
      .then(async (response) => {
        if (response.status === 404) {
          console.warn("No calendar sessions found for coach", coachIdentifier);
          return [];
        }
        if (!response.ok) {
          const details = await response.text();
          throw new Error(details || `HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        const eventsArray = Array.isArray(data)
          ? data
          : (data?.events || data?.data || [data]);

  console.log("Raw API Response:", eventsArray);

        // Format events for react-big-calendar
        const formattedEvents = eventsArray.map((event) => {
          const accent = event.color || "#4A90E2";
          const startDate = new Date(event.startDateTime || event.start);
          const proposedEnd = event.endDateTime || event.end;
          let endDate = proposedEnd ? new Date(proposedEnd) : null;
          const rawProfileImage =
            event.profileImage ||
            event.clientProfileImage ||
            event.clientProfilePicture ||
            event.avatar ||
            event.photo;
          const normalizedProfileImage = normalizeProfileImageSrc(
            rawProfileImage,
            event.profileImageMimeType ||
              event.profileImageType ||
              event.clientProfileImageType ||
              event.imageContentType
          );

          if (!startDate || Number.isNaN(startDate.getTime())) {
            return null;
          }

          if (!endDate || Number.isNaN(endDate.getTime()) || endDate <= startDate) {
            endDate = addMinutes(startDate, 30);
          }

          const startHour = startDate.getHours() + startDate.getMinutes() / 60;
          const endHour = endDate.getHours() + endDate.getMinutes() / 60;
          const isOutsideVisibleRange = startHour < 5 || endHour > 16;

          return {
            id: event.id?.toString() || Math.random().toString(36).substr(2, 9),
            title: event.title || `Session with ${event.clientName || 'Client'}`,
            start: startDate,
            end: endDate,
            allDay: isOutsideVisibleRange,
            color: accent,
            resource: {
              color: accent,
              clientName: event.clientName,
              profileImage: normalizedProfileImage,
              originalStart: startDate,
              originalEnd: endDate,
              isOutsideVisibleRange,
            },
          };
        }).filter(Boolean);
        setEvents(formattedEvents);
      })
      .catch(error => {
        console.error("Error fetching sessions for coach", coachIdentifier, error);
        setEvents([]); // Clear events on error
      });
  }, [user]);

  const CalendarEvent = ({ event }) => {
    const accent = event.resource?.color || "#4A90E2";
    const clientName = event.resource?.clientName?.trim();
    const profileImage = event.resource?.profileImage || defaultAvatar;
    const originalStart = event.resource?.originalStart;
    const originalEnd = event.resource?.originalEnd;
    const timeLabel = originalStart && originalEnd
      ? `${format(originalStart, 'p')} - ${format(originalEnd, 'p')}`
      : null;

    if (currentView === 'month') {
      return (
        <div
          className="calendar-event-month"
          style={{ '--event-accent': accent }}
        >
          <img
            className="calendar-event-month-avatar"
            src={profileImage}
            alt={clientName || event.title}
          />
          <div className="calendar-event-month-text">
            <span className="calendar-event-month-title" title={event.title}>
              {event.title}
            </span>
            {clientName && (
              <span className="calendar-event-month-client" title={clientName}>
                {clientName}
              </span>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="calendar-event-week">
        <img
          className="calendar-event-week-avatar"
          src={profileImage}
          alt={clientName || event.title}
        />
        <div className="calendar-event-week-details">
          <span className="calendar-event-week-title" title={event.title}>
            {event.title}
          </span>
          {timeLabel && (
            <span className="calendar-event-week-time" title={timeLabel}>
              {timeLabel}
            </span>
          )}
          {clientName && (
            <span className="calendar-event-week-client" title={clientName}>
              {clientName}
            </span>
          )}
        </div>
      </div>
    );
  };

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

      <div className="calendar-main" style={{ transition: "width 0.3s ease" }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 16 }}>
          <button
            className="insight-button"
            onClick={toggleChart}
            style={{ background: showChart ? '#473c5f' : '#4caf50', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontSize: '1rem', cursor: 'pointer', transition: 'background 0.2s' }}
          >
            {showChart ? 'Back to Calendar' : 'Show Insights'}
          </button>
        </div>
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: calendarHeight }}
          views={['month', 'week', 'day']}
          view={currentView}
          defaultView="week"
          min={calendarMinTime}
          max={calendarMaxTime}
          scrollToTime={calendarMinTime}
          popup
          selectable
          onSelectSlot={(slotInfo) => {
            const slotStart = slotInfo.start || new Date();
            const slotEnd = slotInfo.end || addMinutes(slotStart, 60);
            setNewEventInfo({ title: '', start: slotStart, end: slotEnd, tag: "Planning" });
            setManualStartTime(format(slotStart, "HH:mm"));
            setManualEndTime(format(slotEnd, "HH:mm"));
            setShowEventModal(true);
          }}
          onSelectEvent={(event) => {
            if (window.confirm(`Are you sure you want to delete '${event.title}'?`)) {
              setEvents(events.filter(e => e.id !== event.id));
            }
          }}
          onView={(view) => setCurrentView(view)}
          eventPropGetter={(event) => ({
            style: currentView === 'month'
              ? {
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: 0,
                  boxShadow: 'none',
                  color: '#2f3142',
                }
              : {
                  backgroundColor: event.resource?.color || '#4A90E2',
                  borderRadius: '8px',
                  color: '#fff',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  fontWeight: 500,
                  fontSize: '1rem',
                  boxShadow: '0 2px 8px rgba(71, 60, 95, 0.12)',
                  padding: '6px 10px',
                }
          })}
          components={{
            event: ({ event }) => <CalendarEvent event={event} />
          }}
        />
      </div>
      {showChart && (
        <div className="chart-container" style={{ width: "10%", height: "40%", background: "none", boxShadow: "none", transition: "width 0.3s ease" }}>
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

      {/* Custom Event Modal for adding new event */}
      {showEventModal && (
        <>
          <div className="modal-backdrop" onClick={() => setShowEventModal(false)}></div>
          <div className="modal">
            <div className="btn-close">
              <button className="modal-close" onClick={() => setShowEventModal(false)}>
                <span style={{ color: "white", fontSize: "1.6rem" }}>&times;</span>
              </button>
            </div>
            <div className="modal-header">
              <span className="modal-title">Add New Event</span>
            </div>
            <form className="modal-form" onSubmit={e => e.preventDefault()}>
              <input
                type="text"
                name="title"
                placeholder="Enter a title for your event"
                value={newEventInfo.title}
                onChange={e => setNewEventInfo({ ...newEventInfo, title: e.target.value })}
                className="modal-input"
                autoFocus
              />
              <select
                name="eventType"
                value={newEventInfo.tag}
                onChange={e => setNewEventInfo({ ...newEventInfo, tag: e.target.value })}
                className="modal-input"
              >
                <option value="Planning">Planing</option>
                <option value="Personal">Personal</option>
              </select>
              <div className="time-input-group">
                <label className="time-input-label">
                  Start Time
                  <input
                    type="time"
                    min="05:00"
                    max="16:00"
                    value={manualStartTime}
                    onChange={(e) => setManualStartTime(e.target.value)}
                    className="modal-input"
                  />
                </label>
                <label className="time-input-label">
                  End Time
                  <input
                    type="time"
                    min="05:00"
                    max="16:00"
                    value={manualEndTime}
                    onChange={(e) => setManualEndTime(e.target.value)}
                    className="modal-input"
                  />
                </label>
              </div>
              <div className="model-btn">
                <button
                  type="button"
                  className="modal-submit"
                  disabled={isSavingEvent}
                  onClick={async () => {
                    if (isSavingEvent) {
                      return;
                    }

                    try {
                      setEventError("");
                      setIsSavingEvent(true);

                      const [startHour, startMinute] = manualStartTime.split(":").map(Number);
                      const [endHour, endMinute] = manualEndTime.split(":").map(Number);
                      const updatedStart = new Date(newEventInfo.start || new Date());
                      const updatedEnd = new Date(newEventInfo.end || new Date());

                      updatedStart.setHours(startHour, startMinute, 0, 0);
                      updatedEnd.setHours(endHour, endMinute, 0, 0);

                      const payload = buildEventPayload({
                        title: newEventInfo.title,
                        start: updatedStart,
                        end: updatedEnd,
                        tag: newEventInfo.tag,
                      });

                      await saveEventToServer(payload);

                      const typeColors = {
                        Planning: "#3498DB",
                        Personal: "#9B59B6",
                        Session: "#4CAF50",
                        Others: "#795548",
                      };

                      const newEvent = {
                        id: `${Date.now()}`,
                        title: newEventInfo.title,
                        start: updatedStart,
                        end: updatedEnd,
                        color: typeColors[newEventInfo.tag] || "#3498DB",
                        tag: newEventInfo.tag,
                      };

                      setEvents((prev) => [...prev, newEvent]);
                      setShowEventModal(false);
                    } catch (err) {
                      console.error('Failed to save calendar event:', err);
                      setEventError(err.message || 'Unable to save event.');
                    } finally {
                      setIsSavingEvent(false);
                    }
                  }}
                >
                  {isSavingEvent ? 'Saving…' : 'Save'}
                </button>
                <button type="button" className="modal-submit" onClick={() => setShowEventModal(false)}>
                  Cancel
                </button>
              </div>
              {eventError && (
                <div style={{ color: '#d32f2f', marginTop: 12, textAlign: 'center' }}>{eventError}</div>
              )}
            </form>
          </div>
        </>
      )}
    </div>
  );
};

export default Calendar;
