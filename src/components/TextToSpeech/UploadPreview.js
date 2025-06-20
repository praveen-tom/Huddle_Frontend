// import React, { useState } from "react";
// import mammoth from "mammoth";
// import * as pdfjsLib from "pdfjs-dist"; // Import default build
// import JSZip from "jszip";

// const UploadPreview = ({ onContentExtracted }) => {
//   const [file, setFile] = useState(null);

//   const handleFileUpload = async (event) => {
//     const uploadedFile = event.target.files[0];
//     setFile(uploadedFile);

//     if (uploadedFile) {
//       const extractedContent = await extractContent(uploadedFile);
//       onContentExtracted(extractedContent); // Pass extracted content to parent
//     }
//   };

//   const extractContent = async (file) => {
//     const reader = new FileReader();

//     return new Promise((resolve, reject) => {
//       reader.onload = async () => {
//         let extractedContent = [];

//         if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
//           try {
//             // Extract Text & Images from DOCX
//             const zip = await JSZip.loadAsync(reader.result);
//             const docxResult = await mammoth.convertToHtml({ arrayBuffer: reader.result });

//             // Extract images
//             const images = [];
//             for (const [relativePath, fileEntry] of Object.entries(zip.files)) {
//               if (
//                 relativePath.startsWith("word/media/") &&
//                 fileEntry.name.match(/\.(png|jpg|jpeg|gif)$/)
//               ) {
//                 const uint8Array = await fileEntry.async("uint8array");
//                 const blob = new Blob([uint8Array], { type: "image/*" });
//                 images.push(URL.createObjectURL(blob));
//               }
//             }

//             // Combine text and images based on HTML structure
//             const parser = new DOMParser();
//             const doc = parser.parseFromString(docxResult.value, "text/html");
//             const paragraphs = doc.querySelectorAll("p");

//             paragraphs.forEach((paragraph) => {
//               const paragraphText = paragraph.textContent.trim();
//               if (paragraphText) {
//                 extractedContent.push({ type: "text", value: paragraphText });
//               }

//               const imagesInParagraph = paragraph.querySelectorAll("img");
//               imagesInParagraph.forEach((img) => {
//                 const imgSrc = img.getAttribute("src");
//                 if (imgSrc) {
//                   extractedContent.push({ type: "image", value: imgSrc });
//                 }
//               });
//             });

//           } catch (error) {
//             reject(`Error extracting .docx content: ${error.message}`);
//           }

//         } else if (file.type === "application/pdf") {
//           try {
//             // Dynamically import the worker script
//             const pdfjsWorker = await import(
//               "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.0.375/pdf.worker.min.mjs"
//             );

//             // Load PDF document with the worker
//             const pdfData = new Uint8Array(reader.result);
//             const pdf = await pdfjsLib.getDocument({
//               data: pdfData,
//               worker: pdfjsWorker,
//             }).promise;

//             for (let i = 0; i < pdf.numPages; i++) {
//               const page = await pdf.getPage(i + 1);
//               const textContent = await page.getTextContent();
//               const text = textContent.items.map((item) => item.str).join(" ");

//               extractedContent.push({ type: "text", value: text });

//              // Extract images using paintImageXObject
// const operatorList = await page.getOperatorList();
// console.log("Extracted paintImageXObject operations:", operatorList.argsArray);
// if (!operatorList || !operatorList.fnArray || !operatorList.argsArray) {
//   console.warn("Invalid or missing operatorList for page");
// } else {
//   console.log(`Processing ${operatorList.fnArray.length} operations...`);

//   // Filter out only the paintImageXObject operations
//   const imageOperations = [];
//   for (let j = 0; j < operatorList.fnArray.length; j++) {
//     if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
//       const imgOp = operatorList.argsArray[j];
//       console.log("Image Operation:", imgOp); // Log the structure of imgOp
//       imageOperations.push(imgOp);
//     }
//   }

//   console.log(`Found ${imageOperations.length} image operations.`);

//   // Process all image operations asynchronously
// for (const imgOp of imageOperations) {
//   let imgName = null; // Initialize imgName with a default value

//   try {
//     // Extract imgName from the first element of the array
//     imgName = imgOp[0]; // Assuming the first element is the image reference

//     // Ensure imgName exists before proceeding
//     if (!imgName) {
//       console.warn("Skipping invalid image operation: imgName is undefined");
//       continue;
//     }

// const maxWaitTime = 20000; // 20 seconds timeout
// const startTime = Date.now();

// while (!page.objs.has(imgName)) {
//   await new Promise((resolve) => setTimeout(resolve, 50)); // Retry every 50ms
//   if (Date.now() - startTime > maxWaitTime) {
//     console.error(`Timeout waiting for image object: ${imgName}`);
//     break; // Use break instead of returning to avoid skipping the next steps
//   }
// }
    
// const imgObj = page.objs.get(imgName);
// console.log("Retrieved Image Object:", imgObj);

// if (!imgObj || !imgObj.data) {
//   console.warn(`Skipping invalid image object for imgName: ${imgName}`, imgObj);
// }

// if (imgObj && imgObj.bitmap) {
//   const bitmap = imgObj.bitmap;
//   console.log("Bitmap Image Data:", bitmap);
// }
// if (imgObj && imgObj.bitmap) {
//   const canvas = document.createElement("canvas");
//   canvas.width = imgObj.bitmap.width;
//   canvas.height = imgObj.bitmap.height;
  
//   const ctx = canvas.getContext("2d");
//   ctx.drawImage(imgObj.bitmap, 0, 0);
  
//   const imgSrc = canvas.toDataURL("image/png"); // Convert to PNG
//   extractedContent.push({ type: "image", value: imgSrc });
// } else {
//   console.warn(`Image object missing data: ${imgName}`);
// }
//   } catch (err) {
//     console.error(`Failed to process image object (${imgName || "unknown"}):`, err);
//   }
// }

// // Fallback: Extract images from annotations
// const annotations = await page.getAnnotations();
// if (!annotations || !Array.isArray(annotations)) {
//   console.warn("Invalid or missing annotations for page");
// } else {
//   for (const annotation of annotations) {
//     if (annotation.subtype === "Image") {
//       const imgData = annotation.image;
//       if (imgData) {
//         const imgType = detectImageType(imgData);
//         const imgBase64 = arrayBufferToBase64(imgData);
//         const imgSrc = `data:${imgType};base64,${imgBase64}`;
//         extractedContent.push({ type: "image", value: imgSrc });
//       }
//     }
//   }
// }

// // Fallback: Extract images from embedded objects
// try {
//   if (page.objs && page.objs.objs) {
//     for (const [key, obj] of Object.entries(page.objs.objs)) {
//         console.log("Checking embedded object:", key, obj);
//         if (obj && obj.data && obj.width && obj.height) {
//             const imgType = detectImageType(obj.data);
//             const imgBase64 = arrayBufferToBase64(obj.data);
//             const imgSrc = `data:${imgType};base64,${imgBase64}`;
//             extractedContent.push({ type: "image", value: imgSrc });
//         }
//     }
// }
// } catch (error) {
//   console.error("Error processing embedded objects:", error);
// }
// }
//           }
//           } catch (error) {
//             reject(`Error extracting .pdf content: ${error.message}`);
//           }

//         } else {
//           reject("Unsupported file type");
//         }

//         resolve(extractedContent);
//       };

//       reader.readAsArrayBuffer(file);
//     });
//   };

//   // Helper function: Detect image type based on file signature
//   function detectImageType(data) {
//     const uint8Array = new Uint8Array(data);
//     if (uint8Array[0] === 0xff && uint8Array[1] === 0xd8) {
//       return "image/jpeg"; // JPEG signature
//     } else if (uint8Array[0] === 0x89 && uint8Array[1] === 0x50) {
//       return "image/png"; // PNG signature
//     } else if (uint8Array[0] === 0x47 && uint8Array[1] === 0x49) {
//       return "image/gif"; // GIF signature
//     } else {
//       return "application/octet-stream"; // Default fallback
//     }
//   }

//   // Helper function: Convert ArrayBuffer to Base64
//   function arrayBufferToBase64(buffer) {
//     let binary = "";
//     const bytes = new Uint8Array(buffer);
//     for (let i = 0; i < bytes.byteLength; i++) {
//       binary += String.fromCharCode(bytes[i]);
//     }
//     return window.btoa(binary);
//   }

//   return (
//     <div>
//       <input type="file" accept=".docx,.pdf" onChange={handleFileUpload} />
//     </div>
//   );
// };

// export default UploadPreview;