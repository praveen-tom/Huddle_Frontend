// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// function UploadFile() {
//   const [file, setFile] = useState(null);
//   const navigate = useNavigate();

//   const handleFileChange = (e) => {
//     setFile(e.target.files[0]);
//   };

//   const handleUpload = () => {
//     if (file) {
//       // Save the file in local storage or state (you can also use state management)
//       const fileURL = URL.createObjectURL(file);
//       localStorage.setItem('pdfFile', fileURL);

//       // Redirect to PDF Viewer
//       navigate.push('/pdf-viewer');
//     } else {
//       alert('Please select a file.');
//     }
//   };

//   return (
//     <div>
//       <h2>Upload a PDF File</h2>
//       <input type="file" accept="application/pdf"/>
//       {/* <button onClick={handleUpload}>Upload & View PDF</button> */}
//       <button>Upload & View PDF</button>
//     </div>
//   );
// }

// export default UploadFile;