import React, { useEffect, useState } from "react";
import ClientProfile from "./ClientProfile";
import "./Client.css";

const Client = () => {
  const [clientList, setClientList] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://localhost:7046/api/Client");
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setClientList(data);
        setFilteredClients(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = clientList.filter((client) =>
      client.name.toLowerCase().includes(term)
    );
    setFilteredClients(filtered);
  };

  const handleClientClick = (client) => {
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`https://localhost:7046/api/Client/GetClientProfileforCoach/5c9e290b-bf20-4efd-a888-cf3e6e92703c`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const profileData = await response.json();
        setSelectedClient(profileData);
        setIsProfileVisible(true);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchProfileData();
  };

  const closeProfile = () => {
    setIsProfileVisible(false);
  };

  return (
    <div className="client-container">
      {!isProfileVisible && (
        <>
          <div className="header">
            <input
              type="text"
              placeholder="Search"
              className="search-input"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

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
              {filteredClients.map((client) => (
                <tr key={client.id} onClick={() => handleClientClick(client)}>
                  <td className="client-name">
                    <img
                      src={client.profileImage} // Profile image
                      alt={client.name}
                      className="profile-image"
                    />
                    {client.name}
                  </td>
                  <td>
                    <span className="last-session">
                      {new Date(client.lastsession).toLocaleDateString()} ago
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
        </>
      )}

      {isProfileVisible && selectedClient && (
        <ClientProfile
          profileData={selectedClient}
          onClose={closeProfile}
          isProfileVisible={isProfileVisible} 
        />
      )}
    </div>
  );
};

export default Client;
