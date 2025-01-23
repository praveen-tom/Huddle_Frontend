import React, { useEffect, useState } from "react";
import ClientProfile from "./ClientProfile";
import "./Client.css";
import { Icon } from "@iconify/react";

const Client = () => {
  const [clientList, setClientList] = useState([]);
  const [filteredClients, setFilteredClients] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isProfileVisible, setIsProfileVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: "", mobile: "", email: "" });
  const [emailError, setEmailError] = useState("");
  const [isInviteSent, setIsInviteSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorPopup, setErrorPopup] = useState(false);
  
  const handleOpenModal = () => {
    setShowModal(true);
    setIsInviteSent(false); // Reset invite status on modal open
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setFormData({ name: "", mobile: "", email: "" });
    setEmailError("");
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (e.target.name === "email" && emailError) setEmailError("");
  };

  const handleSendInvite = async () => {
    if (!validateEmail(formData.email)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    setLoading(true); // Set loading to true when the request starts

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };

    try {
      const response = await fetch("https://localhost:7046/api/Client", requestOptions);

      if (response.ok) {
        setIsInviteSent(true); // Set invite sent flag
      } else {
        const errorData = await response.json();
        alert(`Failed to send invite: ${errorData.message || "Unknown error occurred"}`);
      }
    } catch (error) {
      handleCloseModal(); // Close the client info form on error
      setErrorPopup(true); // Show the error popup
    } finally {
      setLoading(false); // Reset loading state when request completes
    }
  };

  const handleErrorPopupClose = () => setErrorPopup(false); // Close the error popup

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
    console.log(client);
    const fetchProfileData = async () => {
      try {
        const response = await fetch(`https://localhost:7046/api/Client/GetClientProfileforCoach/${client}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        const profileData = await response.json();
        console.log(profileData);
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
            <button className="add-client" onClick={handleOpenModal}>
                      + Add a new Client</button>
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
                <tr className="Client_row_select" key={client.id}  onClick={() => handleClientClick(client.id)}>
                  <td className="client-name">
                   <Icon
                    icon="codicon:account"
                     style={{ color: "1a274f", fontSize: "1.7rem",cursor:"pointer" }}
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



      {/* Modal for Adding Client */}
      {showModal && (
        <>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
          <div className="modal">
            <div className="btn-close">
              <button className="modal-close" onClick={handleCloseModal}>
                <Icon icon="mdi:close-thick" style={{ color: "white", fontSize: "1.6rem" }} />
              </button>
            </div>
            <div className="modal-header">
              <Icon icon="mdi:invite" style={{ color: "white", fontSize: "4.7rem" }} />
              {!isInviteSent ?(
                <span className="modal-title">Add a new client</span>
              ):
              (
                <span className="modal-title">Invitation Sent</span>
              )
              }
              
            </div>
            {!isInviteSent ? (
              <form className="modal-form" onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="modal-input"
                />
                <input
                  type="text"
                  name="mobile"
                  placeholder="Mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  className="modal-input"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="modal-input"
                />
                {emailError && <div className="error-message">{emailError}</div>}
                <div className="model-btn">
                <button
                  type="button"
                  className="modal-submit"
                  onClick={handleSendInvite}
                >
                  Send Invite
                </button>
                </div>
              </form>
            ) : (
              <div className="confirmation">
                <Icon
                  icon="line-md:circle-to-confirm-circle-transition"
                  style={{ color: "1a274f", fontSize: "10rem" }}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Error Popup */}
      {errorPopup && (
        <>
          <div className="modal-backdrop" onClick={handleErrorPopupClose}></div>
          <div className="error-popup">
            <button className="popup-close" onClick={handleErrorPopupClose}>
              ❌
            </button>
            <div className="popup-content">
              <span>
                Something went wrong. Please try again later. If the issue
                persists, please call support.
              </span>
            </div>
          </div>
        </>
      )}

    </div>
  );
};

export default Client;
