import React, { useEffect, useState } from "react";
import ClientProfile from "./ClientProfile";
import "./Client.css";
import { Icon } from "@iconify/react";
import API_ENDPOINTS from "../../apiconfig";


const Client = ({ setCurrentPage }) => {
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.baseurl}/Client`);
        if (!response.ok) {
          throw new Error(`❌ API Error: ${response.status} ${response.statusText}`);
        }
        const responseData = await response.json();
        const clientArray = responseData.data || [];
        console.log("📥 Fetched clients:", clientArray);
        if (!Array.isArray(clientArray)) {
          console.warn("⚠️ Unexpected API response format. Expected an array in 'data'.");
          throw new Error("Invalid API response format.");
        }
        setClientList(clientArray);
        setFilteredClients(clientArray);
        console.log("✅ Clients stored in state:", clientArray);
      } catch (err) {
        console.error("🚀 Failed to fetch clients:", err.message);
        setClientList([]);
        setFilteredClients([]);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (event) => {
    const term = event.target.value.toLowerCase();
    setSearchTerm(term);
    console.log("Search term:", term);
    console.log("clientList:", clientList);
    const filtered = clientList.filter((client) =>
      client.name.toLowerCase().includes(term) ||
    (client.nextSession && client.nextSession.toLowerCase().includes(term))
    );
    setFilteredClients(filtered);
  };

  const handleClientClick = async (client) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.baseurl}/Client/GetClientProfileforCoach/${client.id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const profileData = await response.json();
      setSelectedClient(profileData?.data || null);
      setIsProfileVisible(true);
    } catch (err) {
      console.error("Failed to fetch client profile:", err.message);
    }
  };

  const handleSetCurrentPage = (page, data = null) => {
    setCurrentPage(page, data);
  };

  const closeProfile = () => {
    setIsProfileVisible(false);
  };

  const handleOpenModal = () => {
    setShowModal(true);
    setIsInviteSent(false);
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
    setLoading(true);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    };
    try {
      const response = await fetch(`${API_ENDPOINTS.baseurl}/Client`, requestOptions);
      if (response.ok) {
        setIsInviteSent(true);
        setFormData({ name: "", mobile: "", email: "" });
      } else {
        const errorData = await response.json();
        alert(`Failed to send invite: ${errorData.message || "Unknown error occurred"}`);
      }
    } catch (error) {
      handleCloseModal();
      setErrorPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleErrorPopupClose = () => setErrorPopup(false);

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
              + Add a new Client
            </button>
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
                <tr className="Client_row_select" key={client.id} onClick={() => handleClientClick(client)}>
                  <td className="client-name">
                    <Icon
                      icon="codicon:account"
                      style={{ color: "#1a274f", fontSize: "1.7rem", cursor: "pointer" }}
                    />
                    {client.name}
                  </td>
                  <td>
                  <span className="last-session">
                    {client.lastSession !== null && client.lastSession !== undefined
                      ? `${client.lastSession} days ago`
                      : "N/A"}
                  </span>
                </td>
                <td>
                  <span className={`next-session ${!client.nextSession ? "unplanned" : ""}`}>
                    {client.nextSession ? client.nextSession : "Unplanned"}
                  </span>
                </td>
                  <td>
                    <span className={`payment-status ${client.paymentstatus === "Paid" ? "paid" : "unpaid"}`}>
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
          setCurrentPage={(page, data = null) => handleSetCurrentPage(page, data)} 
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
              <span className="modal-title">{isInviteSent ? "Invitation Sent" : "Add a new client"}</span>
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
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="confirmation">
                <Icon icon="line-md:circle-to-confirm-circle-transition" style={{ color: "#1a274f", fontSize: "10rem" }} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Client;