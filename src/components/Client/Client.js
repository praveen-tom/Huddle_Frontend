import React, { useEffect, useState, useMemo } from "react";
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
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);

  const sortOptions = useMemo(
    () => [
      {
        id: "name-asc",
        label: "Name A → Z",
        config: { key: "name", direction: "asc" },
        icon: "ph:sort-ascending",
      },
      {
        id: "name-desc",
        label: "Name Z → A",
        config: { key: "name", direction: "desc" },
        icon: "ph:sort-descending",
      },
      {
        id: "lastSession-most",
        label: "Most Recent Session",
        config: { key: "lastSession", direction: "asc" },
        icon: "mdi:history",
      },
      {
        id: "lastSession-least",
        label: "Least Recent Session",
        config: { key: "lastSession", direction: "desc" },
        icon: "mdi:history-toggle-off",
      },
      {
        id: "planned-first",
        label: "Planned Sessions First",
        config: { key: "planned", direction: "asc" },
        icon: "mdi:calendar-check",
      },
      {
        id: "unplanned-first",
        label: "Unplanned Sessions First",
        config: { key: "planned", direction: "desc" },
        icon: "mdi:calendar-remove",
      },
    ],
    []
  );

  const getComparableValue = (client, key) => {
    switch (key) {
      case "name":
        return (client?.name || "").toLowerCase();
      case "lastSession": {
        if (client?.lastSession === null || client?.lastSession === undefined) {
          return Number.POSITIVE_INFINITY;
        }
        const numericValue = Number(client.lastSession);
        return Number.isNaN(numericValue) ? Number.POSITIVE_INFINITY : numericValue;
      }
      case "nextSession":
        return (client?.nextSession || "").toString().toLowerCase();
      case "paymentstatus":
        return (client?.paymentstatus || "").toString().toLowerCase();
      case "planned":
        return client?.nextSession ? 0 : 1;
      default:
        return "";
    }
  };

  const applySort = (clients, config = sortConfig) => {
    if (!config?.key) {
      return [...clients];
    }

    const directionMultiplier = config.direction === "asc" ? 1 : -1;

    return [...clients].sort((a, b) => {
      const valueA = getComparableValue(a, config.key);
      const valueB = getComparableValue(b, config.key);

      if (typeof valueA === "number" && typeof valueB === "number") {
        const aIsMissing = !Number.isFinite(valueA);
        const bIsMissing = !Number.isFinite(valueB);

        if (aIsMissing && bIsMissing) return 0;
        if (aIsMissing) return 1;
        if (bIsMissing) return -1;
        return (valueA - valueB) * directionMultiplier;
      }

      const stringA = String(valueA || "");
      const stringB = String(valueB || "");
      const aIsMissing = stringA.length === 0;
      const bIsMissing = stringB.length === 0;

      if (aIsMissing && bIsMissing) return 0;
      if (aIsMissing) return 1;
      if (bIsMissing) return -1;

      return (
        stringA.localeCompare(stringB, undefined, {
          numeric: true,
          sensitivity: "base",
        }) * directionMultiplier
      );
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.baseurl}/Client`);
        if (!response.ok) {
          throw new Error(`❌ API Error: ${response.status} ${response.statusText}`);
        }
        const responseData = await response.json();
        const clientArray = responseData.data || [];
        if (!Array.isArray(clientArray)) {
          console.warn("⚠️ Unexpected API response format. Expected an array in 'data'.");
          throw new Error("Invalid API response format.");
        }
  setClientList(clientArray);
  setFilteredClients(applySort(clientArray, { key: "name", direction: "asc" }));
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
    const filtered = clientList.filter((client) =>
      client.name.toLowerCase().includes(term)
    );
  setFilteredClients(applySort(filtered));
  };

  const handleClientClick = async (client) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.baseurl}/Client/GetClientProfileforCoach/${client.id}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const profileData = await response.json();
      console.log("Client profile data:", profileData);
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

  const toggleSortMenu = () => {
    setIsSortMenuOpen((prev) => !prev);
  };

  const applySortOption = (option) => {
    setSortConfig(option.config);
    setFilteredClients((current) => applySort(current, option.config));
    setIsSortMenuOpen(false);
  };

  const activeSortOption = sortOptions.find(
    (option) =>
      option.config.key === sortConfig.key && option.config.direction === sortConfig.direction
  );

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
          <div className="table-actions">
            <button
              className="sort-button"
              onClick={toggleSortMenu}
              aria-haspopup="menu"
              aria-expanded={isSortMenuOpen}
            >
              <Icon icon="mdi:filter-variant" className="sort-button-icon" />
              {activeSortOption ? activeSortOption.label : "Sort & Filter"}
              <Icon icon={isSortMenuOpen ? "mdi:chevron-up" : "mdi:chevron-down"} />
            </button>
            {isSortMenuOpen && (
              <div className="sort-menu" role="menu">
                {sortOptions.map((option) => (
                  <button
                    key={option.id}
                    className={`sort-menu-item ${
                      activeSortOption?.id === option.id ? "active" : ""
                    }`}
                    onClick={() => applySortOption(option)}
                    role="menuitemradio"
                    aria-checked={activeSortOption?.id === option.id}
                  >
                    <Icon icon={option.icon} className="sort-menu-item-icon" />
                    {option.label}
                    {activeSortOption?.id === option.id && (
                      <Icon icon="mdi:check" className="sort-menu-item-check" />
                    )}
                  </button>
                ))}
              </div>
            )}
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