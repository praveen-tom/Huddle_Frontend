import React, { useState, useEffect } from 'react';
import './PlanSession.css';
import { FaEdit, FaTrash } from 'react-icons/fa';

const PlanSessionPopup = ({ isOpen, onClose, profileData }) => {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
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

  // Load objectives and planned tasks from profileData or local storage on mount
  useEffect(() => {
    const storedObjectives = JSON.parse(localStorage.getItem('objectives')) || [];
    const storedTasks = JSON.parse(localStorage.getItem('plannedTasks')) || [];
    setObjectives(profileData?.objectives?.length ? profileData.objectives : storedObjectives);
    setPlannedTasks(profileData?.plannedTasks?.length ? profileData.plannedTasks : storedTasks);
  }, [profileData]);

  // Save objectives to local storage
  useEffect(() => {
    localStorage.setItem('objectives', JSON.stringify(objectives));
  }, [objectives]);

  // Save planned tasks to local storage
  useEffect(() => {
    localStorage.setItem('plannedTasks', JSON.stringify(plannedTasks));
  }, [plannedTasks]);

  // Handle adding a new objective
  const handleAddObjective = () => {
    if (objectives.length < 5) {
      setIsAddingObjective(true);
      setNewObjective('');
      setEditIndex(null);
    } else {
      alert('You can only add up to 5 objectives.');
    }
  };

  // Save new or edited objective
  const handleSaveObjective = () => {
    if (!newObjective.trim()) {
      alert('Objective cannot be empty.');
      return;
    }
    if (editIndex !== null) {
      const updatedObjectives = [...objectives];
      updatedObjectives[editIndex] = newObjective;
      setObjectives(updatedObjectives);
      setEditIndex(null);
    } else {
      setObjectives([...objectives, newObjective]);
    }
    setNewObjective('');
    setIsAddingObjective(false);
  };

  // Edit objective
  const handleEditObjective = (index) => {
    setNewObjective(objectives[index]);
    setIsAddingObjective(true);
    setEditIndex(index);
  };

  // Delete objective
  const handleDeleteObjective = (index) => {
    const updatedObjectives = objectives.filter((_, i) => i !== index);
    setObjectives(updatedObjectives);
  };

  // Handle radio selection for objectives
  const handleObjectiveSelection = (index) => {
    setSelectedObjective(index);
  };

  // Handle adding a new planned task
  const handleAddTask = () => {
    if (plannedTasks.length < 5) {
      setIsAddingTask(true);
      setNewTask('');
      setTaskEditIndex(null);
    } else {
      alert('You can only add up to 5 planned tasks.');
    }
  };

  // Save new or edited planned task
  const handleSaveTask = () => {
    if (!newTask.trim()) {
      alert('Planned task cannot be empty.');
      return;
    }
    if (taskEditIndex !== null) {
      const updatedTasks = [...plannedTasks];
      updatedTasks[taskEditIndex] = newTask;
      setPlannedTasks(updatedTasks);
      setTaskEditIndex(null);
    } else {
      setPlannedTasks([...plannedTasks, newTask]);
    }
    setNewTask('');
    setIsAddingTask(false);
  };

  // Edit planned task
  const handleEditTask = (index) => {
    setNewTask(plannedTasks[index]);
    setIsAddingTask(true);
    setTaskEditIndex(index);
  };

  // Delete planned task
  const handleDeleteTask = (index) => {
    const updatedTasks = plannedTasks.filter((_, i) => i !== index);
    setPlannedTasks(updatedTasks);
  };

  // Handle radio selection for planned tasks
  const handleTaskSelection = (index) => {
    setSelectedTask(index);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Log form values for debugging
    console.log('Form Values:');
    console.log('Time:', time);
    console.log('Date:', date);
    console.log('Title:', title);
    console.log('Overview:', overview);
    console.log('Objectives:', objectives);
    console.log('Planned Tasks:', plannedTasks);
  
    // Check if the required fields are filled in properly
    if (!title.trim() || !overview.trim()) {
      alert('Please fill in all required fields.');
      return;
    }
  
    const plannedSessionData = {
      Id: "", // Generate a new GUID for the session
      schedulesession: 'some-random-guid', // Replace with actual logic if needed
      title: title,
      notes: overview,
      planneddate: date,
      plannedtime: time,
      status: 'Not Completed',
      CreatedBy: profileData.coachId, // Set as null if coachId is missing
      CreatedDatetime: new Date().toISOString(), // Set as null if coachId is missing
      ModifiedBy: null, // Set as null if coachId is missing
      ModifiedDatetime: new Date().toISOString(),
      tasks: plannedTasks.map(task => ({ task })),
      objectives: objectives.map(objective => ({ Objective: objective })),
    };
  
    // Log the request body for debugging
    console.log('Request Body:', JSON.stringify(plannedSessionData));
  
    try {
      const response = await fetch('https://localhost:7046/api/PlannedSession', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    <div className={`plan-session-popup ${isOpen ? 'open' : ''}`}>
      <div className="popup-content">
        <h2>Plan Session</h2>
        <button onClick={onClose} className="close-button">&#10006;</button>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Time & Date:</label>
            <div className="time-date-container">
              <input type="time" id="time" value={time} onChange={(e) => setTime(e.target.value)} />
              <input type="date" id="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="title">Title:</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="form-group">
            <label htmlFor="overview">Overview:</label>
            <textarea id="overview" value={overview} onChange={(e) => setOverview(e.target.value)}></textarea>
          </div>
          {/* Objectives Section */}
          <div className="form-group">
            <h3>Objectives</h3>
            {objectives.length > 0 ? (
              objectives.map((objective, index) => (
                <div key={index} className="item">
                  <input
                    type="radio"
                    name="selectedObjective"
                    checked={selectedObjective === index}
                    onChange={() => handleObjectiveSelection(index)}
                  />
                  <span>{objective}</span>
                  <FaEdit className="icon" onClick={() => handleEditObjective(index)} />
                  <FaTrash className="icon" onClick={() => handleDeleteObjective(index)} />
                </div>
              ))
            ) : (
              <button type="button" className="button button-success" onClick={handleAddObjective}>Add Objective</button>
            )}
            {isAddingObjective && (
              <div className="add-item-form">
                <input
                  type="text"
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Enter objective"
                />
                <button type="button" className="button button-primary" onClick={handleSaveObjective}>Save</button>
              </div>
            )}
          </div>
          {/* Planned Tasks Section */}
          <div className="form-group">
            <h3>Planned Tasks</h3>
            {plannedTasks.length > 0 ? (
              plannedTasks.map((task, index) => (
                <div key={index} className="item">
                  <input
                    type="radio"
                    name="selectedTask"
                    checked={selectedTask === index}
                    onChange={() => handleTaskSelection(index)}
                  />
                  <span>{task}</span>
                  <FaEdit className="icon" onClick={() => handleEditTask(index)} />
                  <FaTrash className="icon" onClick={() => handleDeleteTask(index)} />
                </div>
              ))
            ) : (
              <button type="button" className="button button-success" onClick={handleAddTask}>Add Planned Task</button>
            )}
            {isAddingTask && (
              <div className="add-item-form">
                <input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Enter planned task"
                />
                <button type="button" className="button button-primary" onClick={handleSaveTask}>Save</button>
              </div>
            )}
          </div>
          <button type="submit" className="button button-primary">Share</button>
        </form>
      </div>
    </div>
  );
};

export default PlanSessionPopup;
