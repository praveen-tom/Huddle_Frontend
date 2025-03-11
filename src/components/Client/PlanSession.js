import React, { useState, useEffect } from 'react';
import './PlanSession.css';
import { Icon } from '@iconify/react';
import { v4 as uuidv4 } from 'uuid';

const PlanSession = ({ profileData, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState("plan");

  // Correct date/time formatting functions
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

  // Correctly reference upcomingSchedule (fixed typo)
  const initialTime = formatTimeForInput(
    profileData?.data?.upcomingSchedule?.plannedTime || ''
  );
  const initialDate = profileData?.data?.upcomingSchedule?.plannedDate
    ? formatDateForInput(profileData.data.upcomingSchedule.plannedDate)
    : '';

  // State management
  const [time, setTime] = useState(initialTime);
  const [date, setDate] = useState(initialDate);
  const [title, setTitle] = useState('');
  const [overview, setOverview] = useState('');
  const [objectives, setObjectives] = useState(
    profileData?.data?.objectives || []
  );
  const [newObjective, setNewObjective] = useState('');
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [plannedTasks, setPlannedTasks] = useState(
    profileData?.data?.plannedTasks || []
  );
  const [newTask, setNewTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskEditIndex, setTaskEditIndex] = useState(null);
  const plannedSessionId = profileData?.data?.upcomingSchedule?.id || null;

  // Sync with localStorage if data not present in profile
  useEffect(() => {
    const storedObjectives = JSON.parse(localStorage.getItem('objectives')) || [];
    const storedTasks = JSON.parse(localStorage.getItem('plannedTasks')) || [];
    
    setObjectives(
      profileData?.data?.objectives?.length 
        ? profileData.data?.objectives 
        : storedObjectives
    );
    
    setPlannedTasks(
      profileData?.data?.plannedTasks?.length 
        ? profileData.data?.plannedTasks 
        : storedTasks
    );
  }, [profileData]);

  useEffect(() => {
    localStorage.setItem('objectives', JSON.stringify(objectives));
  }, [objectives]);

  useEffect(() => {
    localStorage.setItem('plannedTasks', JSON.stringify(plannedTasks));
  }, [plannedTasks]);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Title is required');
      return;
    }

    if (!overview.trim()) {
      alert('Overview is required');
      return;
    }

    if (objectives.length === 0) {
      alert('Add at least 1 objective');
      return;
    }

    if (plannedTasks.length === 0) {
      alert('Add at least 1 planned task');
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
      CreatedBy: profileData.data.coachId || uuidv4(),
      CreatedDatetime: new Date().toISOString(),
      ModifiedBy: profileData.data.coachId || uuidv4(),
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

      if (response.ok) {
        alert('Session planned successfully!');
        localStorage.removeItem('objectives');
        localStorage.removeItem('plannedTasks');
        //setCurrentPage("ClientProfile");
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      alert(`Failed: ${error.message}`);
    }
  };

  // Objective handlers
  const handleAddObjective = () => {
    if (objectives.length < 5) {
      setIsAddingObjective(true);
      setNewObjective('');
      setEditIndex(null);
    } else {
      alert('Max 5 objectives');
    }
  };

  const handleEditObjective = (index) => {
    setNewObjective(objectives[index].Objective);
    setIsAddingObjective(true);
    setEditIndex(index);
  };

  const handleSaveObjective = () => {
    if (!newObjective.trim()) {
      alert('Objective required');
      return;
    }

    const newObjectiveData = {
      Id: uuidv4(),
      plannedsessionid: plannedSessionId,
      Objective: newObjective,
      status: "created"
    };

    if (editIndex !== null) {
      const updated = [...objectives];
      updated[editIndex] = newObjectiveData;
      setObjectives(updated);
      setEditIndex(null);
    } else {
      setObjectives([...objectives, newObjectiveData]);
    }
    
    setIsAddingObjective(false);
    setNewObjective('');
  };

  const handleCancelObjective = () => {
    setIsAddingObjective(false);
    setNewObjective('');
    setEditIndex(null);
  };

  const handleDeleteObjective = (index) => {
    setObjectives(objectives.filter((_, i) => i !== index));
  };

  // Task handlers
  const handleAddTask = () => {
    if (plannedTasks.length < 5) {
      setIsAddingTask(true);
      setNewTask('');
      setTaskEditIndex(null);
    } else {
      alert('Max 5 tasks');
    }
  };

  const handleEditTask = (index) => {
    setNewTask(plannedTasks[index].task);
    setIsAddingTask(true);
    setTaskEditIndex(index);
  };

  const handleSaveTask = () => {
    if (!newTask.trim()) {
      alert('Task required');
      return;
    }

    const newTaskData = {
      Id: uuidv4(),
      plannedsessionid: plannedSessionId,
      task: newTask,
      status: "created"
    };

    if (taskEditIndex !== null) {
      const updated = [...plannedTasks];
      updated[taskEditIndex] = newTaskData;
      setPlannedTasks(updated);
      setTaskEditIndex(null);
    } else {
      setPlannedTasks([...plannedTasks, newTaskData]);
    }
    
    setIsAddingTask(false);
    setNewTask('');
  };

  const handleCancelTask = () => {
    setIsAddingTask(false);
    setNewTask('');
    setTaskEditIndex(null);
  };

  const handleDeleteTask = (index) => {
    setPlannedTasks(plannedTasks.filter((_, i) => i !== index));
  };

  return (
    <div className="plan-session-page">
      {/* Navigation tabs */}
      <div className="vertical-tabs">
        <button 
          className={`plan ${activeTab === 'plan' ? 'active' : ''}`}
          onClick={() => setActiveTab('plan')}
        >
          <Icon icon="lucide:pencil-line" className="icon" />
          Plan
        </button>
        <button 
          className={`goals ${activeTab === 'goals' ? 'active' : ''}`}
          onClick={() => setActiveTab('goals')}
        >
          <Icon icon="octicon:goal-24" className="icon" />
          Goals
        </button>
        <button 
          className={`history ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <Icon icon="material-symbols:history" className="icon" />
          History
        </button>
        <button 
          className={`inspiration ${activeTab === 'inspiration' ? 'active' : ''}`}
          onClick={() => setActiveTab('inspiration')}
        >
          <Icon icon="mdi:lightbulb-on-outline" className="icon" />
          Inspiration
        </button>
      </div>

      {/* Main content area */}
      <div className="main-content">
        {/* Plan tab content */}
        {activeTab === "plan" && (
          <form className="plan_form" onSubmit={handleSubmit}>
            <h2>Plan Session for {profileData.data.name}</h2>
            
            {/* Time & Date inputs */}
            <div className="form-group">
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
            </div>

            {/* Title input */}
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="form-group-input"
              />
            </div>

            {/* Overview textarea */}
            <div className="form-group">
              <label>Overview:</label>
              <textarea
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                className="form-group-textarea"
              />
            </div>

            {/* Objectives section */}
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
                  <p>No objectives added</p>
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
                  <button 
                    className="button button-primary"
                    onClick={handleSaveObjective}
                  >
                    {editIndex !== null ? 'Update' : 'Add'}
                  </button>
                  <button 
                    className="button button-danger"
                    onClick={handleCancelObjective}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  className="button button-primary"
                  onClick={handleAddObjective}
                >
                  + Add Objective
                </button>
              )}
            </div>

            {/* Planned tasks section */}
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
                  <p>No tasks added</p>
                )}
              </div>

              {isAddingTask ? (
                <div className="add-item-form">
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Enter task"
                    className="form-group-input"
                  />
                  <button 
                    className="button button-primary"
                    onClick={handleSaveTask}
                  >
                    {taskEditIndex !== null ? 'Update' : 'Add'}
                  </button>
                  <button 
                    className="button button-danger"
                    onClick={handleCancelTask}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button 
                  className="button button-primary"
                  onClick={handleAddTask}
                >
                  + Add Task
                </button>
              )}
            </div>

            {/* Submit button */}
            <div className="plan-submit-btn">
              <button 
                className="button button-primary"
                type="submit"
              >
                Share
              </button>
            </div>
          </form>
        )}

        {/* Other tabs (to be implemented) */}
        {activeTab === "goals" && <div>Goals content...</div>}
        {activeTab === "history" && <div>History content...</div>}
        {activeTab === "inspiration" && <div>Inspiration content...</div>}
      </div>
    </div>
  );
};

export default PlanSession;