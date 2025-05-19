import React, { useState } from "react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist"; // Import default build
import JSZip from "jszip";
import PDFViewer from "../PDFViewer";

const UploadPreview = ({ onContentExtracted, onPdfSelected = () => {} }) => {
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];

    if (uploadedFile) {
      if (uploadedFile.type === "application/pdf") {
        const url = URL.createObjectURL(uploadedFile);
        setPdfUrl(url); // Show PDFViewer below upload
        onPdfSelected(url); // Still notify parent if needed
        return;
      } else {
        setPdfUrl(null); // Hide PDFViewer for non-PDF files
        const extractedContent = await extractContent(uploadedFile);
        onContentExtracted(extractedContent); // Pass extracted content to parent
      }
    }
  };

  const extractContent = async (file) => {
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onload = async () => {
        let extractedContent = [];

        if (file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
          try {
            // Extract Text & Images from DOCX
            const zip = await JSZip.loadAsync(reader.result);
            const docxResult = await mammoth.convertToHtml({ arrayBuffer: reader.result });

            // Extract images
            const images = [];
            for (const [relativePath, fileEntry] of Object.entries(zip.files)) {
              if (
                relativePath.startsWith("word/media/") &&
                fileEntry.name.match(/\.(png|jpg|jpeg|gif)$/)
              ) {
                const uint8Array = await fileEntry.async("uint8array");
                const blob = new Blob([uint8Array], { type: "image/*" });
                images.push(URL.createObjectURL(blob));
              }
            }

            // Combine text and images based on HTML structure
            const parser = new DOMParser();
            const doc = parser.parseFromString(docxResult.value, "text/html");
            const paragraphs = doc.querySelectorAll("p");

            paragraphs.forEach((paragraph) => {
              const paragraphText = paragraph.textContent.trim();
              if (paragraphText) {
                extractedContent.push({ type: "text", value: paragraphText });
              }

              const imagesInParagraph = paragraph.querySelectorAll("img");
              imagesInParagraph.forEach((img) => {
                const imgSrc = img.getAttribute("src");
                if (imgSrc) {
                  extractedContent.push({ type: "image", value: imgSrc });
                }
              });
            });

          } catch (error) {
            reject(`Error extracting .docx content: ${error.message}`);
          }

        } else if (file.type === "application/pdf") {
          try {
           // Set the worker script for PDF.js
        // Use the same version as the installed pdfjs-dist package
        pdfjsLib.GlobalWorkerOptions.workerSrc =
          `${process.env.PUBLIC_URL || ''}/pdf.worker.min.js`;

    // Load PDF document with the worker
    const pdfData = new Uint8Array(reader.result);
    const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;

   // let extractedContent = [];

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const textContent = await page.getTextContent();
      const operatorList = await page.getOperatorList();

      let elements = [];

      // Extract Text with X, Y Positions
      let textFragments = [];
      textContent.items.forEach((item) => {
        let text = item.str.trim();
        if (text) {
          let y = Math.round(item.transform[5]); // Y-position
          let x = Math.round(item.transform[4]); // X-position
          textFragments.push({ type: "text", value: text, x, y });
        }
      });

      // Group Text Fragments into Lines
      let groupedLines = {};
      textFragments.forEach((fragment) => {
        let lineKey = Math.round(fragment.y); // Use Y-coordinate as the line key
        if (!groupedLines[lineKey]) {
          groupedLines[lineKey] = [];
        }
        groupedLines[lineKey].push(fragment);
      });

      // Sort Fragments in Each Line Left-to-Right
      Object.keys(groupedLines).forEach((lineKey) => {
        groupedLines[lineKey].sort((a, b) => a.x - b.x);
      });

      // Combine Fragments into Lines of Text
      let reconstructedLines = [];
      Object.keys(groupedLines)
        .sort((a, b) => b - a) // Sort lines Top-to-Bottom
        .forEach((lineKey) => {
          let lineText = groupedLines[lineKey]
            .map((fragment) => fragment.value)
            .join(" "); // Join fragments into a single string
          let y = parseInt(lineKey); // Use the Y-coordinate of the line
          reconstructedLines.push({ type: "text", value: lineText, y });
        });

      // Add Reconstructed Lines to Elements
      elements.push(...reconstructedLines);

      // Extract Images in the Same Loop
      for (let j = 0; j < operatorList.fnArray.length; j++) {
        if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
          const imgOp = operatorList.argsArray[j];
          const imgName = imgOp[0];
          const transform = imgOp[1]; // Transform matrix [scaleX, skewY, skewX, scaleY, translateX, translateY]

          await new Promise((resolveImg) => {
            const checkImgLoaded = () => {
              if (page.objs.has(imgName)) {
                const imgObj = page.objs.get(imgName);
                if (imgObj && imgObj.bitmap) {
                  const canvas = document.createElement("canvas");
                  canvas.width = imgObj.bitmap.width;
                  canvas.height = imgObj.bitmap.height;
                  const ctx = canvas.getContext("2d");
                  ctx.drawImage(imgObj.bitmap, 0, 0);

                  // Extract image position from transform matrix
                  const x = Math.round(transform[4]); // X-position
                  const y = Math.round(transform[5]); // Y-position

                  elements.push({
                    type: "image",
                    value: canvas.toDataURL("image/png"),
                    x,
                    y,
                  });
                }
                resolveImg();
              } else {
                setTimeout(checkImgLoaded, 50);
              }
            };
            checkImgLoaded();
          });
        }
      }

      // Sort elements to maintain document order (Top-Down, Left-Right)
      elements.sort((a, b) => {
        if (b.y !== a.y) return b.y - a.y; // Sort Top-to-Bottom
        return a.x - b.x; // Sort Left-to-Right if same Y
      });

      extractedContent.push(...elements);
    }

    resolve(extractedContent);
  } catch (error) {
    reject(`Error extracting .pdf content: ${error.message}`);
  }
        }  else {
          reject("Unsupported file type");
        }

        resolve(extractedContent);
      };

      reader.readAsArrayBuffer(file);
    });
  };

  return (
    <div>
      <input type="file" accept=".docx,.pdf" onChange={handleFileUpload} />
      {pdfUrl && (
        <div style={{ marginTop: 32 }}>
          <PDFViewer documentUrl={pdfUrl} />
        </div>
      )}
    </div>
  );
};

export default UploadPreview;