import React, { useState, useEffect } from 'react';
import './PlanSession.css';
import { Icon } from '@iconify/react';
import { v4 as uuidv4 } from 'uuid';

const PlanSession = ({ profileData, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState("plan");

  // Helper function to convert dd-MM-yyyy to yyyy-MM-dd
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const [day, month, year] = dateString.split('-');
    return `${year}-${month}-${day}`;
  };

  const formatTimeForInput = (timeString) => {
    if (!timeString) return '';
    const [hours, minutes] = timeString.split(':');
    return `${hours.padStart(2, '0')}:${minutes.padStart(2, '0')}`;
  };

  // Extract plannedTime and plannedDate from profileData
  const initialTime = formatTimeForInput(profileData?.upcommingSchedule?.plannedTime || '');
  const initialDate = profileData?.upcommingSchedule?.plannedDate
    ? formatDateForInput(profileData.upcommingSchedule.plannedDate)
    : '';

  // State for time and date
  const [time, setTime] = useState(initialTime);
  const [date, setDate] = useState(initialDate);
  const [title, setTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [objectives, setObjectives] = useState(profileData?.objectives || []);
  const [newObjective, setNewObjective] = useState('');
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [plannedTasks, setPlannedTasks] = useState(profileData?.plannedTasks || []);
  const [newTask, setNewTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskEditIndex, setTaskEditIndex] = useState(null);

  const plannedSessionId = profileData?.upcommingSchedule?.id || null;

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

  // Handle form submission (Plan tab)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please fill in Title.');
      return;
    }

    if (!overview.trim()) {
      alert('Please fill in Overview.');
      return;
    }

    if (objectives.length === 0) {
      alert('Please add at least one objective.');
      return;
    }

    if (plannedTasks.length === 0) {
      alert('Please add at least one planned task.');
      return;
    }

    const plannedSessionData = {
      Id: uuidv4(),
      schedulesession: plannedSessionId || uuidv4(),
      title,
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
        alert(`Failed to create planned session: ${errorData.message || 'Unknown error'}`);
        return;
      }

      alert('Planned session created successfully!');
      localStorage.removeItem('objectives');
      localStorage.removeItem('plannedTasks');

      setCurrentPage("ClientProfile"); // Navigate back to ClientProfile after success
    } catch (error) {
      alert(`Failed to create planned session: ${error.message}`);
    }
  };

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

  const handleEditObjective = (index) => {
    setNewObjective(objectives[index].Objective);
    setIsAddingObjective(true);
    setEditIndex(index);
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

  const handleCancelObjective = () => {
    setIsAddingObjective(false);
    setNewObjective('');
    setEditIndex(null);
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

  const handleEditTask = (index) => {
    setNewTask(plannedTasks[index].task);
    setIsAddingTask(true);
    setTaskEditIndex(index);
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

  const handleCancelTask = () => {
    setIsAddingTask(false);
    setNewTask('');
    setTaskEditIndex(null);
  };

  const handleDeleteTask = (index) => {
    const updatedTasks = plannedTasks.filter((_, i) => i !== index);
    setPlannedTasks(updatedTasks);
  };

  return (
    <div className="plan-session-page">
      {/* Vertical Tabs */}
      <div className="vertical-tabs">
        {/* {["plan", "goals", "history", "inspiration"].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? "active" : ""}
            onClick={(e) => {
              e.preventDefault();
              setActiveTab(tab);
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))} */}

        <button className={`plan ${activeTab === 'plan' ? 'active' : ''}`} onClick={(e) => {
              e.preventDefault();
              setActiveTab('plan');
            }}><Icon
            icon="lucide:pencil-line"
            className="icon"
          />Plan</button>
        <button className={`goals ${activeTab === 'goals' ? 'active' : ''}`} onClick={(e) => {
              e.preventDefault();
              setActiveTab('goals');
            }}><Icon
            icon="octicon:goal-24"
            className="icon"
          />Goals</button>
        <button className={`history ${activeTab === 'history' ? 'active' : ''}`} onClick={(e) => {
              e.preventDefault();
              setActiveTab('history');
            }}><Icon
            icon="material-symbols:history"
            className="icon"
          />History</button>
        <button className={`inspiration ${activeTab === 'inspiration' ? 'active' : ''}`} onClick={(e) => {
              e.preventDefault();
              setActiveTab('inspiration');
            }}><Icon
            icon="mdi:lightbulb-on-outline"
            className="icon"
          />Inspiration</button>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {activeTab === "plan" && (
          <form  className="plan_form" onSubmit={handleSubmit}>
            <h2>Plan Session for {profileData.name}</h2>

            {/* Time & Date */}
            <div className="form-group">
              <label>Time & Date:</label>
              <div className="time-date-container">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(formatTimeForInput(e.target.value))}
                  className="form-group-input"
                />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="form-group-input"
                />
              </div>
            </div>

            {/* Title */}
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-group-input"
              />
            </div>

            {/* Overview */}
            <div className="form-group">
              <label>Overview:</label>
              <textarea
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                className="form-group-textarea"
              />
            </div>

            {/* Objectives Section */}
            <div className="form-group">
              <label>Objectives:</label>
              <div className="plan-goals-container">
                {objectives.length > 0 ? (
                  <ul>
                    {objectives.map((obj, index) => (
                      <li key={obj.Id} className="goal-item">
                        <div className="goal-label">{obj.Objective}</div>
                        <div className="goal-actions">
                          <Icon
                            icon="mdi:pencil"
                            onClick={() => handleEditObjective(index)}
                            className="icon"
                          />
                          <Icon
                            icon="mdi:delete"
                            onClick={() => handleDeleteObjective(index)}
                            className="icon"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No objectives added yet.</p>
                )}
              </div>
              {isAddingObjective ? (
                <div className="add-item-form">
                  <input
                    type="text"
                    value={newObjective}
                    onChange={(e) => setNewObjective(e.target.value)}
                    placeholder="Enter objective"
                    className="form-group-input"
                  />
                  <button className="button button-primary" onClick={handleSaveObjective}>
                    {editIndex !== null ? 'Update' : 'Add'}
                  </button>
                  <button className="button button-danger" onClick={handleCancelObjective}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="button button-primary" onClick={handleAddObjective}>
                  + Add Objective
                </button>
              )}
            </div>

            {/* Planned Tasks Section */}
            <div className="form-group">
              <label>Planned Tasks:</label>
              <div className="plan-goals-container">
                {plannedTasks.length > 0 ? (
                  <ul>
                    {plannedTasks.map((task, index) => (
                      <li key={task.Id} className="goal-item">
                        <div className="goal-label">{task.task}</div>
                        <div className="goal-actions">
                          <Icon
                            icon="mdi:pencil"
                            onClick={() => handleEditTask(index)}
                            className="icon"
                          />
                          <Icon
                            icon="mdi:delete"
                            onClick={() => handleDeleteTask(index)}
                            className="icon"
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No planned tasks added yet.</p>
                )}
              </div>
              {isAddingTask ? (
                <div className="add-item-form">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Enter planned task"
                    className="form-group-input"
                  />
                  <button className="button button-primary" onClick={handleSaveTask}>
                    {taskEditIndex !== null ? 'Update' : 'Add'}
                  </button>
                  <button className="button button-danger" onClick={handleCancelTask}>
                    Cancel
                  </button>
                </div>
              ) : (
                <button className="button button-primary" onClick={handleAddTask}>
                  + Add Planned Task
                </button>
              )}
            </div>
<div className='plan-submit-btn'>
            {/* Submit Button */}
            <button className="button button-primary" type="submit">
              Share
            </button>
            </div>
          </form>
        )}

        {activeTab === "goals" && (
          <div>
            <h2>Goals</h2>
            <p>Goals content goes here.</p>
          </div>
        )}

        {activeTab === "history" && (
          <div>
            <h2>History</h2>
            <p>History content goes here.</p>
          </div>
        )}

        {activeTab === "inspiration" && (
          <div>
            <h2>Inspiration</h2>
            <p>Inspiration content goes here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanSession;