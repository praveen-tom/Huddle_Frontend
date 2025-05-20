import PDFViewer from "../PDFViewer";
import React, { useEffect, useState } from "react";

const PDFViewerArea = ({ pdfUrl, onLoaded }) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [pdfUrl]);

  // PDFViewer must call onLoad when fully loaded
  return pdfUrl ? (
    <div style={{ marginTop: 32 }}>
      <PDFViewer documentUrl={pdfUrl} onLoaded={() => {
        setLoaded(true);
        onLoaded && onLoaded();
      }} />
    </div>
  ) : null;
};

export default PDFViewerArea;
