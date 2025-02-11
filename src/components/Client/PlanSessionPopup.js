import React, { useState, useEffect } from 'react';
import './PlanSession.css';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

const PlanSessionPopup = ({ isOpen, onClose, profileData }) => {
  const [activeTab, setActiveTab] = useState("plan");

  // Helper function to convert dd-MM-yyyy to yyyy-MM-dd
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  };

  // Extract plannedTime and plannedDate from profileData
  const initialTime = profileData?.upcommingSchedule?.plannedTime || '';
  const initialDate = profileData?.upcommingSchedule?.plannedDate
    ? formatDateForInput(profileData.upcommingSchedule.plannedDate)
    : '';

  // State for time and date
  const [time, setTime] = useState(initialTime);
  const [date, setDate] = useState(initialDate);

  // Other states
  const [title, setTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [newObjective, setNewObjective] = useState('');
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [plannedTasks, setPlannedTasks] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTask, setNewTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskEditIndex, setTaskEditIndex] = useState(null);

  const plannedSessionId = profileData?.upcommingSchedule?.id || null;

  console.log('Profile Data:', profileData);
  console.log('Planned Session ID:', plannedSessionId);

  // Load objectives and tasks from localStorage or profileData
  useEffect(() => {
    const storedObjectives = JSON.parse(localStorage.getItem('objectives')) || [];
    const storedTasks = JSON.parse(localStorage.getItem('plannedTasks')) || [];
    setObjectives(profileData?.objectives?.length ? profileData.objectives : storedObjectives);
    setPlannedTasks(profileData?.plannedTasks?.length ? profileData.plannedTasks : storedTasks);
  }, [profileData]);

  useEffect(() => {
    localStorage.setItem('objectives', JSON.stringify(objectives));
  }, [objectives]);

  useEffect(() => {
    localStorage.setItem('plannedTasks', JSON.stringify(plannedTasks));
  }, [plannedTasks]);

  // Handlers for Objectives
  const handleAddObjective = () => {
    if (objectives.length < 5) {
      setIsAddingObjective(true);
      setNewObjective('');
      setEditIndex(null);
    } else {
      alert('You can only add up to 5 objectives.');
    }
  };

  const handleSaveObjective = () => {
    if (!newObjective.trim()) {
      alert('Objective cannot be empty.');
      return;
    }

    const newObjectiveData = {
      Id: uuidv4(),
      plannedsessionid: plannedSessionId,
      Objective: newObjective,
      status: "created"
    };

    if (editIndex !== null) {
      const updatedObjectives = [...objectives];
      updatedObjectives[editIndex] = newObjectiveData;
      setObjectives(updatedObjectives);
      setEditIndex(null);
    } else {
      setObjectives([...objectives, newObjectiveData]);
    }

    setNewObjective('');
    setIsAddingObjective(false);
  };

  const handleEditObjective = (index) => {
    setNewObjective(objectives[index].Objective);
    setIsAddingObjective(true);
    setEditIndex(index);
  };

  const handleDeleteObjective = (index) => {
    const updatedObjectives = objectives.filter((_, i) => i !== index);
    setObjectives(updatedObjectives);
  };

  // Handlers for Planned Tasks
  const handleAddTask = () => {
    if (plannedTasks.length < 5) {
      setIsAddingTask(true);
      setNewTask('');
      setTaskEditIndex(null);
    } else {
      alert('You can only add up to 5 planned tasks.');
    }
  };

  const handleSaveTask = () => {
    if (!newTask.trim()) {
      alert('Planned task cannot be empty.');
      return;
    }

    const newTaskData = {
      Id: uuidv4(),
      plannedsessionid: plannedSessionId,
      task: newTask,
      status: "created"
    };

    if (taskEditIndex !== null) {
      const updatedTasks = [...plannedTasks];
      updatedTasks[taskEditIndex] = newTaskData;
      setPlannedTasks(updatedTasks);
      setTaskEditIndex(null);
    } else {
      setPlannedTasks([...plannedTasks, newTaskData]);
    }

    setNewTask('');
    setIsAddingTask(false);
  };

  const handleEditTask = (index) => {
    setNewTask(plannedTasks[index].task);
    setIsAddingTask(true);
    setTaskEditIndex(index);
  };

  const handleDeleteTask = (index) => {
    const updatedTasks = plannedTasks.filter((_, i) => i !== index);
    setPlannedTasks(updatedTasks);
  };

  // Handle form submission (Plan tab)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !overview.trim()) {
      alert('Please fill in all required fields.');
      return;
    }

    const plannedSessionData = {
      Id: uuidv4(),
      schedulesession: plannedSessionId || 'some-random-guid',
      title: title,
      notes: overview,
      planneddate: date,
      plannedtime: time,
      status: 'Not Completed',
      CreatedBy: profileData.coachId || uuidv4(),
      CreatedDatetime: new Date().toISOString(),
      ModifiedBy: profileData.coachId || uuidv4(),
      ModifiedDatetime: new Date().toISOString(),
      tasks: plannedTasks,
      objectives: objectives
    };

    try {
      const response = await fetch('https://localhost:7046/api/PlannedSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plannedSessionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error Response from Server:', errorData);
        alert(`Failed to create planned session: ${errorData.message || 'Unknown error'}`);
        return;
      }

      const responseData = await response.json();
      console.log('Response from server:', responseData);
      alert('Planned session created successfully!');
      onClose();
    } catch (error) {
      console.error('Error while creating planned session:', error);
      alert(`Failed to create planned session: ${error.message}`);
    }
  };

  return (
    <>
      {/* Backdrop */}
      {/* Popup */}
      <div className={`plan-session-popup ${isOpen ? 'open' : ''}`}>
        <div className="popup-content">
          <button onClick={onClose} className="close-button">X</button>

          {/* Vertical Tabs */}
          <div className="vertical-tabs">
            <button
              className={activeTab === "plan" ? "active" : ""}
              onClick={(e) => { e.preventDefault(); setActiveTab("plan"); }}
            >
              Plan
            </button>
            <button
              className={activeTab === "goals" ? "active" : ""}
              onClick={(e) => { e.preventDefault(); setActiveTab("goals"); }}
            >
              Goals
            </button>
            <button
              className={activeTab === "history" ? "active" : ""}
              onClick={(e) => { e.preventDefault(); setActiveTab("history"); }}
            >
              History
            </button>
            <button
              className={activeTab === "inspiration" ? "active" : ""}
              onClick={(e) => { e.preventDefault(); setActiveTab("inspiration"); }}
            >
              Inspiration
            </button>
          </div>

          {/* Main Content */}
          <div className="main-content">
            {activeTab === "plan" && (
              <form onSubmit={handleSubmit}>
                <h2>Plan Session</h2>

                {/* Time & Date */}
                <label>Time & Date:</label>
                <div className="time-date-container">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="form-group-input"
                  />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="form-group-input"
                  />
                </div>

                {/* Title */}
                <label>Title:</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="form-group-input"
                />

                {/* Overview */}
                <label>Overview:</label>
                <textarea
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                  className="form-group-textarea"
                ></textarea>

                {/* Objectives Section */}
                <h3>Objectives</h3>
                {objectives.length > 0 ? (
                  objectives.map((objective, index) => (
                    <div key={objective.Id} className="item">
                      <span>{objective.Objective}</span>
                      <FaEdit onClick={() => handleEditObjective(index)} className="icon" />
                      <FaTrash onClick={() => handleDeleteObjective(index)} className="icon" />
                    </div>
                  ))
                ) : (
                  <p>No objectives added yet.</p>
                )}
                {isAddingObjective && (
                  <div className="add-item-form">
                    <input
                      type="text"
                      value={newObjective}
                      onChange={(e) => setNewObjective(e.target.value)}
                      placeholder="Enter objective"
                      className="form-group-input"
                    />
                    <button onClick={handleSaveObjective}>Save</button>
                  </div>
                )}
                <button onClick={handleAddObjective}>Add Objective</button>

                {/* Planned Tasks Section */}
                <h3>Planned Tasks</h3>
                {plannedTasks.length > 0 ? (
                  plannedTasks.map((task, index) => (
                    <div key={task.Id} className="item">
                      <span>{task.task}</span>
                      <FaEdit onClick={() => handleEditTask(index)} className="icon" />
                      <FaTrash onClick={() => handleDeleteTask(index)} className="icon" />
                    </div>
                  ))
                ) : (
                  <p>No planned tasks added yet.</p>
                )}
                {isAddingTask && (
                  <div className="add-item-form">
                    <input
                      type="text"
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      placeholder="Enter planned task"
                      className="form-group-input"
                    />
                    <button onClick={handleSaveTask}>Save</button>
                  </div>
                )}
                <button onClick={handleAddTask}>Add Planned Task</button>

                {/* Submit Button */}
                <button type="submit" className="button button-primary">Share</button>
              </form>
            )}

            {activeTab === "goals" && <div>Goals content goes here.</div>}
            {activeTab === "history" && <div>History content goes here.</div>}
            {activeTab === "inspiration" && <div>Inspiration content goes here.</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default PlanSessionPopup;