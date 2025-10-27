import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

const resolveWorkerSrc = () => {
  const base = typeof window !== "undefined" ? window.location.origin : "";
  return `${base}/pdf.worker.min.js`;
};

pdfjs.GlobalWorkerOptions.workerSrc = resolveWorkerSrc();

const PDFViewer = ({ documentUrl, onLoaded }) => {
  const [numPages, setNumPages] = React.useState(null);
  const [loaded, setLoaded] = React.useState(false);
  const [loadError, setLoadError] = React.useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoaded(true);
    setLoadError(null);
    if (onLoaded) onLoaded();
  };

  const handleDocumentError = (error) => {
    console.error("Failed to load PDF document:", error);
    setLoadError(error);
    setLoaded(false);
  };

  return (
    <div>
      <Document
        file={documentUrl}
  onLoadSuccess={onDocumentLoadSuccess}
  onLoadError={handleDocumentError}
  loading={<div>Loading PDF...</div>}
  error={<div>Failed to load PDF.</div>}
      >
        {typeof numPages === "number" && numPages > 0 &&
          Array.from({ length: numPages }, (_, index) => (
            <Page
              key={`page_${index + 1}`}
              pageNumber={index + 1}
              width={undefined} // Let the page take natural width
            />
          ))}
      </Document>
      {loadError && (
        <div style={{ marginTop: 12, color: "#d32f2f" }}>
          Unable to render PDF. Please refresh or download the file directly.
        </div>
      )}
    </div>
  );
};

export default PDFViewer;
