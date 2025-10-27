import React, { useState, useEffect, useRef, useMemo } from "react";
import { Icon } from "@iconify/react";
import "./Client.css";
import SchedulePopup from "./SchedulePopup";
import GoalPopup from "./GoalPopup";
import ShareDocumentPopup from "./ShareDocumentPopup";
import API_ENDPOINTS from "../../apiconfig";

const toSafeString = (value) => {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
};

const resolvePrimaryClientId = (profile, clientIdProp) => {
  const candidate =
    clientIdProp ??
    profile?.clientId ??
    profile?.clientID ??
    profile?.clientid ??
    profile?.id ??
    profile?.Id ??
    profile?.ClientId ??
    profile?.ClientID ??
    profile?.Clientid;

  return toSafeString(candidate);
};

const normalizeDocumentList = (payload, fallbackOwnerId) => {
  const results = [];
  const safeFallback = toSafeString(fallbackOwnerId);

  const pushEntry = (entry, overrides = {}) => {
    if (entry === null || entry === undefined) {
      return;
    }

    if (typeof entry === "string") {
      const documentName = entry.trim();
      if (!documentName) {
        return;
      }
      results.push({
        documentName,
        ownerClientId: overrides.ownerClientId || safeFallback,
        isOwned: overrides.isOwned ?? true,
        documentType: overrides.documentType || "",
        createdAt: overrides.createdAt || "",
        s3Key: overrides.s3Key || "",
      });
      return;
    }

    const documentName = toSafeString(
      entry.documentName ?? entry.fileName ?? entry.name ?? entry.FileName
    );

    if (!documentName) {
      return;
    }

    results.push({
      documentName,
      ownerClientId: toSafeString(entry.ownerClientId) || overrides.ownerClientId || safeFallback,
      isOwned:
        typeof entry.isOwned === "boolean"
          ? entry.isOwned
          : overrides.isOwned ?? false,
      documentType: toSafeString(entry.documentType || overrides.documentType),
      createdAt: toSafeString(entry.createdAt || overrides.createdAt),
      s3Key: toSafeString(entry.s3Key || overrides.s3Key),
    });
  };

  const appendFromArray = (maybeArray, overrides) => {
    if (!Array.isArray(maybeArray)) {
      return;
    }
    maybeArray.forEach((entry) => pushEntry(entry, overrides));
  };

  appendFromArray(payload?.ownedDocuments, { isOwned: true, ownerClientId: safeFallback });
  appendFromArray(payload?.sharedDocuments, { isOwned: false });

  if (results.length === 0) {
    appendFromArray(payload?.documents, { isOwned: true, ownerClientId: safeFallback });
  }

  return results;
};

const ClientProfile = ({
  profileData,
  isOpen,
  onClose,
  isProfileVisible,
  clientId,
  setCurrentPage,
}) => {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isGoalPopupOpen, setIsGoalPopupOpen] = useState(false);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);
  const [documentToShare, setDocumentToShare] = useState(null);
  const [goals, setGoals] = useState(profileData?.goals || []);
  const [documentList, setDocumentList] = useState(() =>
    normalizeDocumentList(profileData, resolvePrimaryClientId(profileData, clientId))
  );
  const [isUploading, setIsUploading] = useState(false);
  const [activeDocumentMenu, setActiveDocumentMenu] = useState(null);
  const fileInputRef = useRef(null);
  const moods = profileData?.moods || [];
  const today = new Date().toISOString().split("T")[0];
  const todayIndex = moods.findIndex((mood) => mood.createdDate === today);
  const [currentIndex, setCurrentIndex] = useState(todayIndex !== -1 ? todayIndex : 0);

  // State to track which session tab (Upcoming/Past) is active
  const [activeSessionTab, setActiveSessionTab] = useState("upcoming");

  const resolvedClientId = useMemo(
    () => resolvePrimaryClientId(profileData, clientId),
    [profileData, clientId]
  );

  if (!profileData) {
    return <div>Loading...</div>;
  }

  useEffect(() => {
    setDocumentList(normalizeDocumentList(profileData, resolvedClientId));
  }, [profileData, resolvedClientId]);

  useEffect(() => {
    if (!activeDocumentMenu) {
      return undefined;
    }

    const handleClickAway = (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest(".document-actions-menu")) {
        return;
      }
      setActiveDocumentMenu(null);
    };

    document.addEventListener("mousedown", handleClickAway);
    return () => document.removeEventListener("mousedown", handleClickAway);
  }, [activeDocumentMenu]);

  // Filter upcoming and past sessions based on status
  const upcomingSessions = profileData?.upcomingSchedule?.filter(
    (session) => session.status !== "Completed"
  );
  const pastSessions = profileData?.upcomingSchedule?.filter(
    (session) => session.status === "Completed")
    .slice(0, 3)
    .sort((a, b) => new Date(a.plannedDate) - new Date(b.plannedDate));
  
  const openBlobInNewTab = (blob, fileName, contentType) => {
    if (typeof window === "undefined") {
      console.error("❌ Unable to open document preview outside browser context");
      return;
    }

    const blobWithType = contentType
      ? blob.slice(0, blob.size, contentType)
      : blob;

    const blobUrl = window.URL.createObjectURL(blobWithType);
    const newWindow = window.open(blobUrl, "_blank", "noopener,noreferrer");

    if (!newWindow) {
      const link = document.createElement("a");
      link.href = blobUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.download = fileName;
      link.click();
    }

    window.setTimeout(() => {
      window.URL.revokeObjectURL(blobUrl);
    }, 60_000);
  };

  const openFilePicker = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };
  const handleDocumentAction = async (action, doc) => {
    const fileName = doc?.documentName ?? (typeof doc === "string" ? doc : "");
    const ownerClientId = toSafeString(doc?.ownerClientId) || resolvedClientId;

    if (!fileName) {
      console.error("❌ Missing document name for action.");
      setActiveDocumentMenu(null);
      return;
    }

    if (!ownerClientId) {
      console.error("❌ Missing owner client identifier for document action.");
      setActiveDocumentMenu(null);
      return;
    }

    if (action === "view") {
      try {
        const response = await fetch(
          `${API_ENDPOINTS.baseurl}/Client/viewsupportingdocument?clientId=${encodeURIComponent(
            ownerClientId
          )}&fileName=${encodeURIComponent(fileName)}`
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type") || "application/octet-stream";
        const blob = await response.blob();
        openBlobInNewTab(blob, fileName, contentType);
      } catch (error) {
        console.error("❌ Failed to load document preview:", error);
      } finally {
        setActiveDocumentMenu(null);
      }
      return;
    }

    if (action === "share") {
      if (doc?.isOwned === false) {
        console.warn("⚠️ Share option is unavailable for shared documents.");
        setActiveDocumentMenu(null);
        return;
      }
      setDocumentToShare(doc);
      setIsSharePopupOpen(true);
      setActiveDocumentMenu(null);
      return;
    }

    if (action === "delete") {
      if (doc?.isOwned === false) {
        console.warn("⚠️ Delete option is unavailable for shared documents.");
        setActiveDocumentMenu(null);
        return;
      }
      try {
        const response = await fetch(
          `${API_ENDPOINTS.baseurl}/Client/deletefile?clientId=${encodeURIComponent(
            ownerClientId
          )}&fileName=${encodeURIComponent(fileName)}`,
          {
            method: "PATCH",
          }
        );

        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        setDocumentList((prev) =>
          prev.filter(
            (entry) => entry.documentName !== fileName || entry.ownerClientId !== ownerClientId
          )
        );
      } catch (error) {
        console.error("❌ Failed to delete document:", error);
      } finally {
        setActiveDocumentMenu(null);
      }
      return;
    }

    setActiveDocumentMenu(null);
  };


  const handleDocumentUpload = async (event) => {
    const [file] = Array.from(event.target.files || []);

    if (!file) {
      return;
    }

    if (!resolvedClientId) {
      console.error("❌ Missing client identifier for upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setIsUploading(true);
      const response = await fetch(
        `${API_ENDPOINTS.baseurl}/Client/upload?clientId=${encodeURIComponent(
          resolvedClientId
        )}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      let data = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (data?.data) {
        const normalized = normalizeDocumentList(data.data, resolvedClientId);
        if (normalized.length > 0) {
          setDocumentList(normalized);
        } else {
          setDocumentList((prev) => [
            ...prev,
            {
              documentName: file.name,
              ownerClientId: resolvedClientId,
              isOwned: true,
              documentType: file.type || "",
              createdAt: new Date().toISOString(),
              s3Key: "",
            },
          ]);
        }
      } else {
        setDocumentList((prev) => [
          ...prev,
          {
            documentName: file.name,
            ownerClientId: resolvedClientId,
            isOwned: true,
            documentType: file.type || "",
            createdAt: new Date().toISOString(),
            s3Key: "",
          },
        ]);
      }
    } catch (error) {
      console.error("❌ Failed to upload documents:", error);
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  const handleAddGoal = (newGoal) => {
    setGoals([...goals, newGoal]);
  };


  const handlePlanSessionOpen = async (session,tab) => { 
      const response = await fetch(`${API_ENDPOINTS.baseurl}/Client/GetPlanHistory/${profileData.coachId}/${profileData.clientId}`);
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      const planHistoryData = await response.json();
      console.log("✅ Plan session history data:", planHistoryData.data);
    if (typeof setCurrentPage === "function") {
      setCurrentPage("Plan Session", { ...profileData, upcomingSchedule: [session], planHistory: planHistoryData.data.planHistories,Plantemplate:planHistoryData.data.planTemplate,tab });
    } else {
      console.error("❌ setCurrentPage is not defined or not a function");
    }
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : moods.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < moods.length - 1 ? prev + 1 : 0));
  };

  const currentMood = moods[currentIndex];
  const getMoodImage = (moodType) => `/MOODS/${moodType.toUpperCase()}.png`;

  return (
    <div className={`clientprofile-panel ${isOpen ? "open" : ""}`}>
       <div className="header">
        <button className="close-button" onClick={onClose}>
          ✖
        </button>
        <h2>{profileData.name}'s Profile</h2>
      </div>
             {/* Profile Details Grid */}
      <div className="profile-details-grid">
        {/* Section 1: Profile and Sessions */}
        <div className="section1">
          {/* Profile Box */}
          <div className="profile-box">
            <div className="profile-header">
              <h4>PROFILE</h4>
            </div>
            <div className="profile-content">
              <div className="profile-pic-container">
                <img
                  src={
                    profileData.profileImage
                      ? profileData.profileImage
                      : "/ProfilePic/default-avatar.png"
                  }
                  alt="Profile"
                  className="profile-image"
                />
              </div>
              <h3 className="profile-name">{profileData.name}</h3>
              <button className="message-btn">Message</button>
            </div>
          </div>
          <div className="gap"></div>
          {/* Sessions Box */}
          <div className="session-box">
            <div className="session-header">
              <h4>SESSIONS</h4>
            </div>
            <div className="session-buttons-container">
              <div className="session-buttons">
                {/* Upcoming Button */}
                <button
                  className={`upcoming ${
                    activeSessionTab === "upcoming" ? "btn active" : "btn"
                  }`}
                  onClick={() => setActiveSessionTab("upcoming")}
                >
                  Upcoming
                </button>
                {/* Past Button */}
                <button
                  className={`past ${
                    activeSessionTab === "past" ? "btn active" : "btn"
                  }`}
                  onClick={() => setActiveSessionTab("past")}
                >
                  Past
                </button>
                {/* Display Upcoming Sessions */}
                {activeSessionTab === "upcoming" &&
                upcomingSessions?.length > 0 ? (
                  upcomingSessions.map((session, index) => (
                    <div key={index} className="session-info">
                      <p className="session-list">
                        {`${session.sessiontitle} - ${session.plannedDate} at ${session.plannedTime}`}
                      </p>
                      <button
                        className="session-btn plan"
                        onClick={() => handlePlanSessionOpen(session,"plan")}
                      >
                        Plan
                      </button>
                    </div>
                  ))
                ) : activeSessionTab === "upcoming" ? (
                  <p>No upcoming sessions</p>
                ) : null}
                {/* Display Past Sessions */}
                {activeSessionTab === "past" &&
                pastSessions?.length > 0 ? (
                  pastSessions.map((session, index) => (
                    <div key={index} className="session-information">
                      <p className="session-list">
                        {`${session.plannedDate} - ${session.sessiontitle}`}
                      </p>
                    </div>
                  ))
                ) : activeSessionTab === "past" ? (
                  <p>No past sessions</p>
                ) : null}
                {activeSessionTab ==="past" && pastSessions?.length > 0 ? (
                <button className="session-viewmore"  onClick={() => handlePlanSessionOpen("","history")}>View more</button>
                ) :  null}
              </div>
              {/* Schedule Button */}
              <div className="schedule-btn">
                <button
                  className="session-btn schedule"
                  onClick={() => setIsPopupOpen(true)}
                >
                  + Schedule
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Info and Goals */}
        <div className="section2">
          {/* Personal Information Box */}
          <div className="personalinfo-box">
            <div className="personalinfo-header">
              <h4>INFORMATION</h4>
            </div>
            <div className="info-details">
              <p><strong>Age:</strong> {profileData.age || "N/A"}</p>
              <p><strong>Occupation:</strong> {profileData.occupation || "N/A"}</p>
              <p><strong>Mobile:</strong> {profileData.mobile || "N/A"}</p>
              <p><strong>Email:</strong> {profileData.email || "N/A"}</p>
              <p><strong>Diagnosis:</strong> {profileData.diagnosis || "N/A"}</p>
              <p><strong>Medication:</strong> {profileData.medication || "N/A"}</p>
              <p><strong>Payment:</strong> {profileData.paymenttype || "N/A"}</p>
            </div>
          </div>
          <div className="gap"></div>
          {/* Goals Box */}
          <div className="goals-box">
            <div className="goals-header">
              <h4>GOALS</h4>
            </div>
            <div className="goals-container">
              <div className="goals-content">
                {goals.length === 0 && <p>No goals</p>}
                {goals.map((goal, index) => (
                  <div key={index} className="goal-item">
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
              <button
                className="add-button"
                onClick={() => setIsGoalPopupOpen(true)}
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: Notes */}
        <div className="section3">
          <div className="notes-box">
            <div className="notes-header">
              <h4>NOTES</h4>
            </div>
            <div className="notes-details">
              <div className="notes-icon">
                <Icon
                  icon="nimbus:edit"
                  style={{ color: "#25376f", fontSize: "2.7rem" }}
                />
              </div>
              <div className="notes-list">
                {profileData?.notes?.length === 0 && <p>No notes</p>}
                {profileData?.notes?.map((item, index) => (
                  <p key={index} className="notes-item">
                    <span className="notes-text">{item}</span>
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Mood and Documents */}
        <div className="section4">
          {/* Mood Box */}
          <div className="moods-box">
            <div className="moods-header">
              <h4>MOOD</h4>
            </div>
            <div className="moods-details">
              {profileData?.moods?.length === 0 && <p>No data</p>}
              {profileData?.moods?.length > 0 && (
                <div className="mood-item">
                  <div className="mood-date">
                    <Icon
                      icon="flat-color-icons:previous"
                      onClick={handlePrevious}
                      width="20"
                      height="20"
                    />
                    {currentMood.createdDate}
                    <Icon
                      icon="flat-color-icons:next"
                      onClick={handleNext}
                      width="20"
                      height="20"
                    />
                  </div>
                  <div className="mood-icon">
                    <img
                      src={getMoodImage(currentMood.moodType)}
                      alt={currentMood.moodType}
                    />
                  </div>
                  <div className="mood-text">{currentMood.moodType}</div>
                </div>
              )}
            </div>
          </div>
          <div className="gap"></div>
          {/* Documents Box */}
          <div className="document-box">
            <div className="document-header">
              <h4>DOCS</h4>
            </div>
            <div className="document-content">
              <div className="document-actions">
              <button
                type="button"
                className="document-upload-btn"
                onClick={openFilePicker}
                disabled={isUploading}
              >
                <Icon icon="mdi:plus" width="20" height="20" />
                <span className="document-upload-label">Upload</span>
              </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleDocumentUpload}
                  style={{ display: "none" }}
                />
              </div>
              {isUploading && <p className="document-status">Uploading...</p>}
              {documentList.length === 0 ? (
                <p>No documents available.</p>
              ) : (
                <ul>
                  {documentList.map((doc, index) => {
                    const menuKey = `${doc.documentName}|${toSafeString(doc.ownerClientId) || "self"}`;
                    return (
                      <li
                        key={`${doc.documentName}-${doc.ownerClientId || "unknown"}-${index}`}
                      >
                      <div className="document-list-item">
                        <span className="document-name">
                          {index + 1}. {doc.documentName}
                          {doc.isOwned === false && (
                            <span className="document-shared-label"> (Shared)</span>
                          )}
                        </span>
                        <div className="document-actions-menu">
                          <button
                            type="button"
                            className="document-options-btn"
                            onClick={() =>
                              setActiveDocumentMenu((current) =>
                                current === menuKey ? null : menuKey
                              )
                            }
                          >
                            <Icon icon="mdi:dots-vertical" width="20" height="20" />
                          </button>
                          {activeDocumentMenu === menuKey && (
                            <div className="document-options-dropdown">
                              <button
                                type="button"
                                className="document-option"
                                onClick={() => handleDocumentAction("view", doc)}
                              >
                                View
                              </button>
                              {doc.isOwned !== false && (
                                <button
                                  type="button"
                                  className="document-option"
                                  onClick={() => handleDocumentAction("share", doc)}
                                >
                                  Share
                                </button>
                              )}
                              {doc.isOwned !== false && (
                                <button
                                  type="button"
                                  className="document-option"
                                  onClick={() => handleDocumentAction("delete", doc)}
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Schedule Popup */}
      {isPopupOpen && (
        <SchedulePopup
          onClose={() => setIsPopupOpen(false)}
          clientName={profileData.name}
          profileData={profileData}
        />
      )}

      {/* Goal Popup */}
      {isGoalPopupOpen && (
        <GoalPopup
          onClose={() => setIsGoalPopupOpen(false)}
          onSave={handleAddGoal}
          profileData={profileData}
        />
      )}

      {isSharePopupOpen && documentToShare && (
        <ShareDocumentPopup
          currentClientId={resolvedClientId}
          currentClientName={profileData.name}
          documentName={documentToShare.documentName}
          onClose={() => {
            setIsSharePopupOpen(false);
            setDocumentToShare(null);
          }}
        />
      )}
    </div>
  );
};

export default ClientProfile;