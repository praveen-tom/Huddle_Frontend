import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import "./Client.css";

const Client = () => {
  const [clientlist, setClientList] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortLatest, setSortLatest] = useState(false);
  const handleClientClick = (client) => {
    setSelectedClient(client);
    setIsCoachProfileOpen(true);
  };
  const [isCoachProfileOpen, setIsCoachProfileOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null); // Track selected client
  const [sessionStatus, setSessionStatus] = useState('upcoming'); // Track session status (upcoming or past)
  const handleSessionButtonClick = (status) => {
    setSessionStatus(status);
  };

  const toggleCoachProfile = () => {
    setIsCoachProfileOpen(!isCoachProfileOpen);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://localhost:7046/api/Client");
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setClientList(data);
        setFilteredClients(data); // Initialize filteredClients
      } catch (err) {
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  // Handle search input change
  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = clientlist.filter((client) =>
      client.name.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
  };

  // Handle sorting by latest session
  const handleSortLatest = () => {
    const sorted = [...filteredClients].sort((a, b) => {
      const dateA = new Date(a.lastsession);
      const dateB = new Date(b.lastsession);
      return sortLatest ? dateA - dateB : dateB - dateA; // Toggle ascending/descending
    });
    setSortLatest(!sortLatest); // Toggle sort order
    setFilteredClients(sorted);
  };

  // Filter clients with "Unplanned" next session
  const handleFilterUnplanned = () => {
    const filtered = clientlist.filter(
      (client) => client.nextsession === "Unplanned"
    );
    setFilteredClients(filtered);
  };

  // Reset filters
  const resetFilters = () => {
    setFilteredClients(clientlist);
    setSearchTerm("");
  };

  return (
    <div className="client-container">
      <div className="header">
        <div>
        <input
          type="text"
          placeholder="Search"
          className="search-input"
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="filter-button" onClick={handleFilterUnplanned}>
          Filter: Unplanned
        </button>
        <button className="sort-button" onClick={handleSortLatest}>
          {sortLatest ? "Sort: Oldest" : "Sort: Latest"}
        </button>
        <button className="add-client-button" onClick={resetFilters}>
          Reset Filters
        </button>
        </div>
        <div>
          <button className="add-client-button"> <span><Icon icon="ic:baseline-plus" style={{ color: "#233469", fontSize: "1.2rem" }} /></span>Add Client</button>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <table className="client-table">
        <thead>
          <tr>
            <th>Client Name</th>
            <th>Last Session</th>
            <th>Next Session</th>
            <th>Payment Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredClients.map((client, index) => (
            <tr key={index}>
              <td className="client-name">
                <img
                  src={client.profileImage} // Replace with actual image URL field
                  alt={client.name}
                  className="profile-image"
                />
                {client.name}
              </td>
              <td>
                <span className="last-session">
                  {client.lastsession} ago
                </span>
              </td>
              <td>
                <span
                  className={`next-session ${
                    client.nextsession === "Unplanned" ? "unplanned" : ""
                  }`}
                >
                  {client.nextsession}
                </span>
              </td>
              <td>
                <span
                  className={`payment-status ${
                    client.paymentstatus === "Paid" ? "paid" : "unpaid"
                  }`}
                >
                  {client.paymentstatus === "Paid" ? "✔️" : "❌"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

    {isCoachProfileOpen && selectedClient && (
    <div className="client-profile-modal">
      <div className="modal-content">
        <div className="header">
          <h2>{selectedClient.name}'s Profile</h2>
          <button onClick={() => setIsCoachProfileOpen(false)}>&#10006;</button>
        </div>
        <div className="profile-details-grid">
          <div className="profile-box">
            <h4>Basic Info</h4>
            <div className="profile-pic-container">
              <img
                src="https://via.placeholder.com/100"
                alt={`${selectedClient.name}'s profile`}
                className="profile-image"
              />
            </div>
            <h4 className="profile-name">{selectedClient.name}</h4>
            <button className="message-btn">Message</button>
          </div>

          <div className="profile-box">
            <h4>Sessions</h4>
            <div className="session-buttons-container">
              <button
                className={`session-btn ${sessionStatus === 'upcoming' ? 'selected' : ''}`}
                onClick={() => handleSessionButtonClick('upcoming')}
              >
                Upcoming
              </button>
              <button
                className={`session-btn ${sessionStatus === 'past' ? 'selected' : ''}`}
                onClick={() => handleSessionButtonClick('past')}
              >
                Past
              </button>
            </div>
          </div>

          <div className="profile-box">
            <h4>Information</h4>
            <div className="info-details">
              <p><strong>Name:</strong> {}</p>
              <p><strong>Qualification:</strong> {}</p>
              <p><strong>Mobile:</strong> {}</p>
              <p><strong>Email:</strong> {}</p>
              <p><strong>Age:</strong> {}</p>
            </div>
          </div>

          <div className="profile-box">
            <h4>Goals</h4>
            <ul>
              <li>Goal 1</li>
              <li>Goal 2</li>
              <li>Goal 3</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )}
    </div>
  );
};


export default Client;
