import React, { useState, useEffect } from 'react';
import './PlanSession.css';
import { Icon } from '@iconify/react';
import { v4 as uuidv4 } from 'uuid';

const PlanSession = ({ profileData, setCurrentPage }) => {
  const [activeTab, setActiveTab] = useState(profileData.tab);

  console.log("setcurrentPage", setCurrentPage);

  const [selectedGoals, setSelectedGoals] = useState([]);

  console.log("Selected Goals:", selectedGoals);

  const formatDateToDayMonthYear = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString); // Convert the string to a Date object
    const options = { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' };
    const formattedDate = new Intl.DateTimeFormat('en-US', options).format(date);
  
    // Ensure the format is "Mon, 10-Mar-2025"
    return formattedDate.replace(/, /g, '-').replace('-', ', ');
  };

  // Log the received profileData for debugging
  console.log("Profile Data in PlanSession:", profileData);

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

  // Extract the single session from upcomingSchedule
  const selectedSession = profileData?.upcomingSchedule?.[0];

  // Initialize state using the selected session's data
  const initialTime = formatTimeForInput(selectedSession?.plannedTime || '');
  const initialDate = selectedSession?.plannedDate
    ? formatDateForInput(selectedSession.plannedDate)
    : '';

  // State management
  const [time, setTime] = useState(initialTime);
  const [date, setDate] = useState(initialDate);
  const [title, setTitle] = useState(selectedSession?.sessiontitle || '');
  const [overview, setOverview] = useState('');
  const [objectives, setObjectives] = useState([]);
  const [newObjective, setNewObjective] = useState('');
  const [isAddingObjective, setIsAddingObjective] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [plannedTasks, setPlannedTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskEditIndex, setTaskEditIndex] = useState(null);
  const [planHistory, setPlanHistory] = useState([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [templateTitle, setTemplateTitle] = useState("");
  // Sync objectives and tasks with localStorage
  useEffect(() => {
    const storedObjectives = JSON.parse(localStorage.getItem('objectives')) || [];
    const storedTasks = JSON.parse(localStorage.getItem('plannedTasks')) || [];
    setObjectives(storedObjectives);
    setPlannedTasks(storedTasks);
  }, []);
  console.log(planHistory, "planHistory")
  console.log(objectives, "templateobjectives")
  console.log(plannedTasks, "templateplannedTasks")

  useEffect(() => {
    localStorage.setItem('objectives', JSON.stringify(objectives));
  }, [objectives]);

  useEffect(() => {
    localStorage.setItem('plannedTasks', JSON.stringify(plannedTasks));
  }, [plannedTasks]);


  useEffect(() => {
    localStorage.setItem('planHistory', JSON.stringify(planHistory));
  }, [planHistory]);

// Form submission handler
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!title.trim()) {
    alert("Title is required");
    return;
  }
  if (!overview.trim()) {
    alert("Overview is required");
    return;
  }
  if (objectives.length === 0) {
    alert("Add at least 1 objective");
    return;
  }
  if (plannedTasks.length === 0) {
    alert("Add at least 1 planned task");
    return;
  }

  // Ask the user if they want to save as a template
  const saveAsTemplate = window.confirm("Do you want to save this as a template?");
  if (saveAsTemplate) {
    // Open the modal to enter the template title
    setIsTemplateModalOpen(true);
  } else {
    // Directly submit the form
    await submitPlannedSession();
  }
};

// Function to handle template submission
const handleTemplateSubmit = async () => {
  if (!templateTitle.trim()) {
    alert("Template title is required");
    return;
  }

  const templateData = {
    templatetitle: templateTitle,
    isTemplate: true,
    Id: uuidv4(),
    schedulesession: selectedSession?.id || uuidv4(),
    title,
    notes: overview,
    planneddate: date,
    plannedtime: time,
    status: "Not Completed",
    CreatedBy: profileData.coachId || uuidv4(),
    CreatedDatetime: new Date().toISOString(),
    ModifiedBy: profileData.coachId || uuidv4(),
    ModifiedDatetime: new Date().toISOString(),
    tasks: plannedTasks,
    objectives: objectives,
    goalid: selectedGoals,
  };

  console.log("Template Data:", templateData); // Log the request body

  try {
    const response = await fetch("https://localhost:7046/api/PlannedSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(templateData),
    });

    if (response.ok) {
      alert("Template saved successfully!");
      setIsTemplateModalOpen(false);
      localStorage.removeItem("objectives");
      localStorage.removeItem("plannedTasks");
      if (typeof setCurrentPage === "function") {
        setCurrentPage("Daily Huddle");
      } else {
        console.error("❌ setCurrentPage is not defined or not a function");
      }
    } else {
      const errorData = await response.json();
      console.error("Error Response:", errorData); // Log server error response
      alert(`Error: ${errorData.message || "Unknown error"}`);
    }
  } catch (error) {
    console.error("Error:", error); // Log the error
    alert(`Failed: ${error.message}`);
  }
};
// Function to submit the planned session
const submitPlannedSession = async () => {
  const plannedSessionData = {
    Id: uuidv4(),
    schedulesession: selectedSession?.id || uuidv4(),
    title,
    notes: overview,
    planneddate: date,
    plannedtime: time,
    status: "Not Completed",
    CreatedBy: profileData.coachId || uuidv4(),
    CreatedDatetime: new Date().toISOString(),
    ModifiedBy: profileData.coachId || uuidv4(),
    ModifiedDatetime: new Date().toISOString(),
    tasks: plannedTasks,
    objectives: objectives,
  };

  try {
    const response = await fetch("https://localhost:7046/api/PlannedSession", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(plannedSessionData),
    });

    if (response.ok) {
      alert("Session planned successfully!");
      localStorage.removeItem("objectives");
      localStorage.removeItem("plannedTasks");
      if (typeof setCurrentPage === "function") {
        setCurrentPage("Daily Huddle");
      } else {
        console.error("❌ setCurrentPage is not defined or not a function");
      }
    } else {
      const errorData = await response.json();
      alert(`Error: ${errorData.message || "Unknown error"}`);
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
      plannedsessionid: selectedSession?.id,
      Objective: newObjective,
      status: "created",
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
      plannedsessionid: selectedSession?.id,
      task: newTask,
      status: "created",
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

  // Handler for checkbox selection
const handleGoalSelection = (e, goal) => {
  if (e.target.checked) {
    // Add the goal to the selectedGoals array
    setSelectedGoals((prev) => [...prev, goal]);
  } else {
    // Remove the goal from the selectedGoals array
    setSelectedGoals((prev) => prev.filter((g) => g !== goal));
  }
};

const handleTemplateSelection = (template) => {
  // Set the active tab to "plan"
  setActiveTab("plan");
  console.log("Selected Template:", template);
  // Populate the fields with the template's details
  setTitle(template.templatetitle || "");
  setOverview(template.notes || "");
  setObjectives(template.objectives || []);
  setPlannedTasks(template.tasks || []);
  setSelectedGoals(template.goalid || []);
  setDate(template.planneddate || "");
  setTime(template.plannedtime || "");
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
            <h2>Plan Session for {profileData.name}</h2>

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
            {/* Goals: */}
            <div className="form-group">
              <label>Goals:</label>
              <div className="form-group-dropdown">
  <label>Select Goals:</label>
  <div className="dropdown">
    <button className="dropdown-button">
      Select Goals
      <Icon icon="mdi:chevron-down" className="dropdown-icon" />
    </button>
    <div className="dropdown-content">
      {profileData.goalslist.map((goal, index) => (
        <div key={index} className="dropdown-item">
          <input
            type="checkbox"
            id={`goal-${index}`}
            value={goal._id}
            onChange={(e) => handleGoalSelection(e, goal._id)}
          />
          <label htmlFor={`goal-${index}`}>{goal.goalTitle}</label>
        </div>
      ))}
    </div>
  </div>
</div>
            </div>

            {/* Objectives section */}
            <div className="form-group">
              <label>Objectives:</label>
              <div className="plan-goals-container">
                {objectives.length > 0 ? (
                  <ul>
                    {objectives.map((obj, index) => (
                      <li key={obj.Id} className="goal-item">
                        <div className="goal-label">{obj.objective}</div>
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
        {activeTab === "goals" && <div>
          <label className='tab-heading'>Coaching Plan</label>
           <div className="section3">
              <div className="coachplan-goal-box">
                <div className="coachplan-goals-header">
                  <h4>GOALS</h4>
                </div>
                <div className="coachplan-goal-details">
                  <div className="coachplan-goals-content">
                  {profileData.goals.length === 0 && <p>No goals</p>}
                  {profileData.goals.map((goal, index) => (
                  <div key={index} className="coachplan-goal-item">
                  <div className="goal-icon">
                  <Icon
                  icon="mage:goals"
                  style={{ color: "#25376f", fontSize: "2.7rem" }}
                  />
                  </div>
                  <div className="goal-text">{goal}</div>
                   <button
                className="add-goal-button"
                >
               Add to plan
              </button>
                  </div>
                  ))}
                  </div>
                </div>
              </div>
          </div>
        </div>
         
      }
        {activeTab === "history" && <div>
          <label className='tab-heading'>Session History</label>
          {profileData.planHistory.length === 0 ? (
  <p>No data</p>
) : (
  profileData.planHistory.map((history, index) => (
    <div className="section3">
             <div className="notes-box">
               <div className="notes-header">
                 <h4>{history.sessionTitle}</h4>
               </div>
               <div className="history-content">
                 
                 <div className="history-header">
                     <p  className="">
                       <span className="header-title">{formatDateToDayMonthYear(history.plannedDate)}</span>
                     </p>
                     <p  className="">
                       <span className="header-client">{profileData.name}</span>
                     </p>
                     </div>
                     <div className='history-body'>
                     <div className="history-objectives">
                       <label className='obj-title'>Objectives:</label>
         {history.objective.map((obj, i) => (
           <li key={i} className="objective-item">{obj.objective}</li>
         ))}
       </div>
       <div className='history-notes'>
         <label className='noted-title'>Notes:</label>
         <p className="notes">{history.notes}</p>
       </div>
       </div>
                 
               </div>
             </div>
           </div>
           ))
)}
          </div>}
        {activeTab === "inspiration" && <div>
          <label className='tab-heading'>Inspiration</label>
          {/* Discssion Box */}
           <div className="section3">
                    <div className="discussion-box">
                      <div className="dicussion-header">
                        <h4>DISCUSSION</h4>
                      </div>
                      <div className="discssion-content">
                        <p className='discssion-content-title'>Client not too chatty? Here are some topics to get discussions flowing in your sessions:</p>
                        <div className='discssion-details'>
                  {profileData.goals.length === 0 && <p>No goals</p>}
                  {profileData.goals.map((goal, index) => (
                  <div key={index} className="discssion-item">
                  <div className="goal-icon">
                  <Icon
                  icon="mage:goals"
                  style={{ color: "#25376f", fontSize: "2.7rem" }}
                  />
                  </div>
                  <div className="goal-text">{goal}</div>
                   <button
                className="add-goal-button"
                >
               Add to plan
              </button>
                  </div>
                  ))}
                  </div>
                      
                     
                      </div>
                    </div>
                  </div>

          {/* GAMES Box */}
          <div className="section3">
                    <div className="game-box">
                      <div className="game-header">
                        <h4>GAMES</h4>
                      </div>
                      <div className="game-content">
                        <p className='game-content-title'>Need to make your sessions a bit more fun? Check out these 15 minute games:</p>
                        <div className='game-details'>
                  {profileData.goals.length === 0 && <p>No goals</p>}
                  {profileData.goals.map((goal, index) => (
                  <div key={index} className="game-item">
                  <div className="goal-icon">
                  <Icon
                  icon="mage:goals"
                  style={{ color: "#25376f", fontSize: "2.7rem" }}
                  />
                  </div>
                  <div className="goal-text">{goal}</div>
                   
                  </div>
                  ))}
                  </div>
                      
                     
                      </div>
                    </div>
                  </div>

          {/* TEMPLATES Box */}
          
          <div className="section3">
                    <div className="template-box">
                      <div className="template-header">
                        <h4>TEMPLATES</h4>
                      </div>
                      <div className="template-content">
                        <p className='template-content-title'>Bit bored of your coaching style? Check out these templates to switch up your sessions:</p>
                        <div className='template-details'>
                  {profileData.goals.length === 0 && <p>No Template</p>}
                  {profileData.Plantemplate.map((template, index) => (
                  <div key={index} className="template-item" onClick={() => handleTemplateSelection(template)}>
                  <div className="goal-icon">
                  <Icon
                  icon="mage:goals"
                  style={{ color: "#25376f", fontSize: "2.7rem" }}
                  />
                  </div>
                  <div className="goal-text">{template.templatetitle}</div>
                   
                  </div>
                  ))}
                  </div>
                      </div>
                    </div>
                  </div>
          </div>}

          {isTemplateModalOpen && (
  <div className="savetemplate-modal">
    <div className="savetemplate-modal-content">
      <h3>Save as Template</h3>
      <input
        type="text"
        placeholder="Enter template title"
        value={templateTitle}
        onChange={(e) => setTemplateTitle(e.target.value)}
        className="form-group-input"
      />
      <div className="savetemplate-modal-actions">
        <button className="button button-primary" onClick={handleTemplateSubmit}>
          Submit
        </button>
        <button
          className="button button-danger"
          onClick={() => setIsTemplateModalOpen(false)}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
      </div>
    </div>
  );
};

export default PlanSession;