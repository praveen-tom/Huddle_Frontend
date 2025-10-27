import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { toast } from "react-toastify";
import API_ENDPOINTS from "../../apiconfig";
import "./ShareDocumentPopup.css";

const normalizeGuidCandidate = (value) => {
  if (value === null || value === undefined) {
    return "";
  }

  const raw = String(value).trim();

  if (raw.length === 0) {
    return "";
  }

  const unquoted = raw.replace(/^"|"$/g, "");
  const unwrapped = unquoted.replace(/^[{(\[]+|[})\]]+$/g, "");
  const hyphenatedMatch = unwrapped.match(
    /[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/
  );

  if (hyphenatedMatch) {
    return hyphenatedMatch[0].toLowerCase();
  }

  const compactMatch = unwrapped.match(/^[0-9a-fA-F]{32}$/);
  if (compactMatch) {
    const digits = compactMatch[0].toLowerCase();
    return [
      digits.slice(0, 8),
      digits.slice(8, 12),
      digits.slice(12, 16),
      digits.slice(16, 20),
      digits.slice(20),
    ].join("-");
  }

  return unwrapped.toLowerCase();
};

const extractClientId = (client) => {
  if (!client || typeof client !== "object") {
    return undefined;
  }

  const idCandidate =
    client.id ??
    client.clientId ??
    client.clientID ??
    client.clientid ??
    client.Id ??
    client.ClientId ??
    client.ClientID ??
    client.Clientid;

  const normalized = normalizeGuidCandidate(idCandidate);
  return normalized.length > 0 ? normalized : undefined;
};

const extractClientName = (client) => {
  if (!client || typeof client !== "object") {
    return "";
  }

  return (
    client.name ??
    client.clientName ??
    client.fullName ??
    client.ClientName ??
    client.email ??
    client.mobile ??
    ""
  );
};

const collectSharedIds = (payload) => {
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.data)
    ? payload.data
    : Array.isArray(payload?.data?.sharedClients)
    ? payload.data.sharedClients
    : Array.isArray(payload?.data?.clientIds)
    ? payload.data.clientIds
    : Array.isArray(payload?.sharedClients)
    ? payload.sharedClients
    : Array.isArray(payload?.clientIds)
    ? payload.clientIds
    : [];

  return source.map((entry) => {
    if (typeof entry === "string" || typeof entry === "number") {
      const normalized = normalizeGuidCandidate(entry);
      return normalized.length > 0 ? normalized : undefined;
    }
    return extractClientId(entry);
  }).filter(Boolean);
};

const sortClientEntries = (entries) =>
  [...entries].sort((a, b) => {
    if (a.hasAccess === b.hasAccess) {
      return a.displayName.localeCompare(b.displayName, undefined, {
        sensitivity: "base",
      });
    }
    return a.hasAccess ? -1 : 1;
  });

const ShareDocumentPopup = ({
  currentClientId,
  currentClientName,
  documentName,
  onClose,
}) => {
  const [clientEntries, setClientEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingClientId, setPendingClientId] = useState(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchData = async () => {
      if (!documentName) {
        setErrorMessage("Document name is missing.");
        setIsLoading(false);
        return;
      }

      const normalizedPrimaryId = normalizeGuidCandidate(currentClientId);
      if (!normalizedPrimaryId) {
        setErrorMessage("Client information is missing.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setErrorMessage("");

      try {
        const clientPromise = fetch(`${API_ENDPOINTS.baseurl}/Client`);
        const sharedPromise = fetch(
          `${API_ENDPOINTS.baseurl}/Client/getsupportingdocsharedinfo?clientId=${encodeURIComponent(
            normalizedPrimaryId
          )}&fileName=${encodeURIComponent(documentName)}`
        );

        const [clientsResponse, sharedResponse] = await Promise.all([
          clientPromise,
          sharedPromise,
        ]);

        if (!clientsResponse.ok) {
          throw new Error(
            `Failed to fetch clients: ${clientsResponse.status} ${clientsResponse.statusText}`
          );
        }

        if (!sharedResponse.ok) {
          throw new Error(
            `Failed to fetch share info: ${sharedResponse.status} ${sharedResponse.statusText}`
          );
        }

        const clientsJson = await clientsResponse.json();
        const sharedJson = await sharedResponse.json();

        const sharedIds = new Set(collectSharedIds(sharedJson));
        const normalizedClients = Array.isArray(clientsJson?.data)
          ? clientsJson.data
          : Array.isArray(clientsJson)
          ? clientsJson
          : [];

        const preparedEntries = normalizedClients
          .map((client) => {
            const normalizedId = extractClientId(client);
            const rawName = extractClientName(client);
            const displayName = rawName ? String(rawName).trim() : "";
            const emailValue = client.email ?? client.Email ?? "";
            return {
              id: normalizedId,
              displayName: displayName || "Unnamed client",
              email: emailValue ? String(emailValue).trim() : "",
              hasAccess: normalizedId ? sharedIds.has(normalizedId) : false,
            };
          })
          .filter((entry) => {
            if (!entry.id && !entry.displayName) {
              return false;
            }
            if (entry.id && normalizedPrimaryId && entry.id === normalizedPrimaryId) {
              return false;
            }
            if (entry.displayName && currentClientName) {
              const comparableEntryName = entry.displayName.trim().toLowerCase();
              const comparableCurrentName = String(currentClientName).trim().toLowerCase();
              if (comparableEntryName === comparableCurrentName) {
                return false;
              }
            }
            if (!entry.id && entry.displayName === "Unnamed client") {
              return false;
            }
            return true;
          });

        if (!isCancelled) {
          setClientEntries(sortClientEntries(preparedEntries));
        }
      } catch (error) {
        console.error("Failed to load share popup data:", error);
        if (!isCancelled) {
          setErrorMessage("Unable to load client list. Please try again later.");
          setClientEntries([]);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isCancelled = true;
    };
  }, [currentClientId, currentClientName, documentName]);

  const updateClientAccessState = (targetId, hasAccess) => {
    const normalizedTargetId = normalizeGuidCandidate(targetId);
    if (!normalizedTargetId) {
      return;
    }

    setClientEntries((previous) =>
      sortClientEntries(
        previous.map((entry) =>
          normalizeGuidCandidate(entry.id) === normalizedTargetId
            ? {
                ...entry,
                hasAccess,
              }
            : entry
        )
      )
    );
  };

  const handleGrantAccess = async (entry) => {
    if (!entry?.id || !documentName || !currentClientId) {
      toast.error("Missing information required to grant access.");
      return;
    }

    if (pendingClientId) {
      return;
    }

    const primaryId = normalizeGuidCandidate(currentClientId);
    const sharedId = normalizeGuidCandidate(entry.id);
    const encodedUrl = `${API_ENDPOINTS.baseurl}/Client/grantsharedaccess?primaryClientId=${encodeURIComponent(
      primaryId
    )}&sharedClientId=${encodeURIComponent(sharedId)}&documentName=${encodeURIComponent(
      documentName
    )}`;

    setPendingClientId(sharedId);

    try {
      const response = await fetch(encodedUrl, { method: "POST" });

      if (!response.ok) {
        let errorDetail = `${response.status} ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson?.message) {
            errorDetail = errorJson.message;
          }
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorDetail = errorText;
            }
          } catch (textError) {
            // Ignore parsing issues, fall back to default detail.
          }
        }

        throw new Error(errorDetail);
      }

      updateClientAccessState(sharedId, true);
      toast.success("Access granted");
    } catch (error) {
      console.error("Failed to grant access:", error);
      toast.error(error.message || "Unable to grant access. Please try again.");
    } finally {
      setPendingClientId(null);
    }
  };

  const handleRevokeAccess = async (entry) => {
    if (!entry?.id || !documentName || !currentClientId) {
      toast.error("Missing information required to revoke access.");
      return;
    }

    if (pendingClientId) {
      return;
    }

    const primaryId = normalizeGuidCandidate(currentClientId);
    const sharedId = normalizeGuidCandidate(entry.id);
    if (!primaryId || !sharedId) {
      toast.error("Invalid client identifiers.");
      return;
    }

    const encodedUrl = `${API_ENDPOINTS.baseurl}/Client/RevokeSharedAccess?primaryClientId=${encodeURIComponent(
      primaryId
    )}&sharedClientId=${encodeURIComponent(sharedId)}&documentName=${encodeURIComponent(
      documentName
    )}`;

    setPendingClientId(sharedId);

    try {
      const response = await fetch(encodedUrl, { method: "POST" });

      if (!response.ok) {
        let errorDetail = `${response.status} ${response.statusText}`;
        try {
          const errorJson = await response.json();
          if (errorJson?.message) {
            errorDetail = errorJson.message;
          }
        } catch (jsonError) {
          try {
            const errorText = await response.text();
            if (errorText) {
              errorDetail = errorText;
            }
          } catch (textError) {
            // Ignore parsing issues, fall back to default detail.
          }
        }

        throw new Error(errorDetail);
      }

      let successMessage = "Access revoked";
      try {
        const successJson = await response.clone().json();
        if (successJson?.message) {
          successMessage = successJson.message;
        }
      } catch (jsonError) {
        try {
          const successText = await response.text();
          if (successText) {
            successMessage = successText;
          }
        } catch (textError) {
          // Ignore parsing issues, keep default success message.
        }
      }

      updateClientAccessState(sharedId, false);
      toast.success(successMessage);
    } catch (error) {
      console.error("Failed to revoke access:", error);
      toast.error(error.message || "Unable to revoke access. Please try again.");
    } finally {
      setPendingClientId(null);
    }
  };

  return (
    <>
      <div className="modal-backdrop" onClick={onClose}></div>
      <div className="modal share-document-modal">
        <div className="btn-close">
          <button className="modal-close" onClick={onClose} aria-label="Close share popup">
            <Icon icon="mdi:close-thick" style={{ color: "white", fontSize: "1.6rem" }} />
          </button>
        </div>
        <div className="modal-header share-document-modal__header">
          <Icon icon="mdi:share-variant" style={{ color: "white", fontSize: "4.2rem" }} />
          <span className="modal-title">
            Share {documentName ? `"${documentName}"` : "document"}
          </span>
        </div>
        <div className="modal-form share-document-modal__body">
          {isLoading && <p className="share-document-modal__status">Loading clients...</p>}
          {!isLoading && errorMessage && (
            <p className="share-document-modal__error">{errorMessage}</p>
          )}
          {!isLoading && !errorMessage && clientEntries.length === 0 && (
            <p className="share-document-modal__status">No other clients are available.</p>
          )}
          {!isLoading && !errorMessage && clientEntries.length > 0 && (
            <ul className="share-document-modal__list">
              {clientEntries.map((entry) => (
                <li key={entry.id ?? entry.displayName} className="share-document-modal__item">
                  <div className="share-document-modal__details">
                    <span className="share-document-modal__name">{entry.displayName}</span>
                    {entry.email && (
                      <span className="share-document-modal__meta">{entry.email}</span>
                    )}
                  </div>
                  {entry.hasAccess ? (
                    <button
                      type="button"
                      className="share-document-modal__action share-document-modal__action--revoke"
                      onClick={() => handleRevokeAccess(entry)}
                      disabled={pendingClientId === normalizeGuidCandidate(entry.id)}
                    >
                      Revoke access
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="share-document-modal__action share-document-modal__action--grant"
                      onClick={() => handleGrantAccess(entry)}
                      disabled={pendingClientId === normalizeGuidCandidate(entry.id)}
                    >
                      Grant access
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default ShareDocumentPopup;
