// import React, { useEffect, useState } from 'react';
// import * as pdfjsLib from 'pdfjs-dist/webpack';
// import { useHistory } from 'react-router-dom';

// function PDFViewer() {
//   const [pdfText, setPdfText] = useState('');
//   const history = useHistory();

//   useEffect(() => {
//     // Get the PDF file from local storage or backend
//     const pdfFileUrl = localStorage.getItem('pdfFile');
//     if (!pdfFileUrl) {
//       history.push('/');
//       return;
//     }

//     // Load and render the PDF
//     const loadingTask = pdfjsLib.getDocument(pdfFileUrl);
//     loadingTask.promise.then((pdf) => {
//       const numPages = pdf.numPages;
//       let textContent = '';

//       // Loop through each page and extract text
//       for (let i = 1; i <= numPages; i++) {
//         pdf.getPage(i).then((page) => {
//           page.getTextContent().then((textContentObj) => {
//             textContentObj.items.forEach((item) => {
//               textContent += `${item.str} `;
//             });
//             setPdfText(textContent); // Store extracted text
//           });
//         });
//       }
//     });
//   }, [history]);

//   const speakText = () => {
//     if ('speechSynthesis' in window) {
//       const utterance = new SpeechSynthesisUtterance(pdfText);
//       window.speechSynthesis.speak(utterance);
//     } else {
//       alert('Text-to-Speech is not supported in this browser.');
//     }
//   };

//   return (
//     <div>
//       <h2>PDF Viewer</h2>
//       <iframe
//         src={localStorage.getItem('pdfFile')}
//         width="100%"
//         height="600px"
//         title="PDF Viewer"
//       ></iframe>
//       <button onClick={speakText}>Read PDF Text</button>
//       <div>
//         <h4>Extracted Text:</h4>
//         <p>{pdfText}</p>
//       </div>
//     </div>
//   );
// }

// export default PDFViewer;