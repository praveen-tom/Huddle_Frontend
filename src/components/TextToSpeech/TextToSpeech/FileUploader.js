import React from "react";

const FileUploader = ({ onFileUpload }) => (
  <div style={{ marginBottom: 24 }}>
    <label htmlFor="file-upload" style={{ fontWeight: 'bold', marginRight: 8 }}>Upload File:</label>
    <input
      id="file-upload"
      type="file"
      accept=".docx,.pdf"
      onChange={onFileUpload}
      title="Choose a DOCX or PDF file to upload"
      placeholder="Select a file"
    />
  </div>
);

export default FileUploader;
