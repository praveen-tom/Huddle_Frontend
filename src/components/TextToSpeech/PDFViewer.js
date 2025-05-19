import React from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";

// Set workerSrc for pdfjs
pdfjs.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ''}/pdf.worker.min.js`;

const PDFViewer = ({ documentUrl }) => {
  const [numPages, setNumPages] = React.useState(null);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  return (
    <div>
      <Document
        file={documentUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={<div>Loading PDF...</div>}
        error={<div>Failed to load PDF.</div>}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            key={`page_${index + 1}`}
            pageNumber={index + 1}
            width={undefined} // Let the page take natural width
          />
        ))}
      </Document>
    </div>
  );
};

export default PDFViewer;
