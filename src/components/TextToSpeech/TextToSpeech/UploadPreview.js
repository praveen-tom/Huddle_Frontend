import React, { useState } from "react";
import mammoth from "mammoth";
import * as pdfjsLib from "pdfjs-dist";
import JSZip from "jszip";
import FileUploader from "./FileUploader";
import PlayPauseTTS from "./PlayPauseTTS";
import PDFViewerArea from "./PDFViewerArea";
import TextToSpeech from "./TextToSpeech";

const UploadPreview = ({ onContentExtracted, onPdfSelected = () => {}, coachId }) => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [lastUploadedContent, setLastUploadedContent] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showTTS, setShowTTS] = useState(false);
  const [ttsContent, setTtsContent] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [pdfLoaded, setPdfLoaded] = useState(false);

  const handleFileUpload = async (event) => {
    const uploadedFile = event.target.files[0];
    setShowTTS(false);
    setTtsContent("");
    setIsPlaying(false);
    setIsPaused(false);
    setPdfLoaded(false);
    if (uploadedFile) {
      if (uploadedFile.type === "application/pdf") {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        try {
          const response = await fetch("https://localhost:7046/api/Article/PdfToJson", {
            method: "POST",
            body: formData,
          });
          if (!response.ok) {
            throw new Error("Failed to convert PDF to JSON");
          }
          const data = await response.json();
          const normalizedPages = normalizeContent(data);
          if (!normalizedPages.length) {
            setLastUploadedContent(null);
            onContentExtracted && onContentExtracted(null);
            setErrorMsg('PDF extraction failed: No content found. Please try another file or contact support.');
            return;
          }
          onContentExtracted && onContentExtracted(normalizedPages);
          setLastUploadedContent(normalizedPages);
          setErrorMsg('');
        } catch (err) {
          setLastUploadedContent(null);
          onContentExtracted && onContentExtracted(null);
          setErrorMsg('Failed to send PDF to backend: ' + err.message);
        }
        const url = URL.createObjectURL(uploadedFile);
        setPdfUrl(url);
        onPdfSelected(url);
        return;
      } else {
        setPdfUrl(null);
        setErrorMsg('');
        const extractedContent = await extractContent(uploadedFile);
        const normalizedContent = normalizeContent(extractedContent);
        onContentExtracted && onContentExtracted(normalizedContent);
        setLastUploadedContent(normalizedContent);
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
            const zip = await JSZip.loadAsync(reader.result);
            const docxResult = await mammoth.convertToHtml({ arrayBuffer: reader.result });
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
            pdfjsLib.GlobalWorkerOptions.workerSrc = `${process.env.PUBLIC_URL || ''}/pdf.worker.min.js`;
            const pdfData = new Uint8Array(reader.result);
            const pdf = await pdfjsLib.getDocument({ data: pdfData }).promise;
            for (let i = 0; i < pdf.numPages; i++) {
              const page = await pdf.getPage(i + 1);
              const textContent = await page.getTextContent();
              const operatorList = await page.getOperatorList();
              let elements = [];
              let textFragments = [];
              textContent.items.forEach((item) => {
                let text = item.str.trim();
                if (text) {
                  let y = Math.round(item.transform[5]);
                  let x = Math.round(item.transform[4]);
                  textFragments.push({ type: 'text', value: text, x, y });
                }
              });
              let groupedLines = {};
              textFragments.forEach((fragment) => {
                let lineKey = Math.round(fragment.y);
                if (!groupedLines[lineKey]) {
                  groupedLines[lineKey] = [];
                }
                groupedLines[lineKey].push(fragment);
              });
              Object.keys(groupedLines).forEach((lineKey) => {
                groupedLines[lineKey].sort((a, b) => a.x - b.x);
              });
              let reconstructedLines = [];
              Object.keys(groupedLines)
                .sort((a, b) => b - a)
                .forEach((lineKey) => {
                  let lineText = groupedLines[lineKey]
                    .map((fragment) => fragment.value)
                    .join(" ");
                  let y = parseInt(lineKey);
                  reconstructedLines.push({ type: "text", value: lineText, y });
                });
              elements.push(...reconstructedLines);
              for (let j = 0; j < operatorList.fnArray.length; j++) {
                if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                  const imgOp = operatorList.argsArray[j];
                  const imgName = imgOp[0];
                  const transform = imgOp[1];
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
                          const x = Math.round(transform[4]);
                          const y = Math.round(transform[5]);
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
              elements.sort((a, b) => {
                if (b.y !== a.y) return b.y - a.y;
                return a.x - b.x;
              });
              extractedContent.push(...elements);
            }
            resolve(extractedContent);
          } catch (error) {
            reject(`Error extracting .pdf content: ${error.message}`);
          }
        } else {
          reject("Unsupported file type");
        }
        resolve(extractedContent);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  // --- TTS Controls Logic ---
  const getCombinedText = () => {
    if (!lastUploadedContent) return "";
    if (typeof lastUploadedContent === 'string') {
      return lastUploadedContent;
    } else if (Array.isArray(lastUploadedContent)) {
      return lastUploadedContent
        .filter(item => item && (item.value || item.text || item.Text))
        .map(item => item.value || item.text || item.Text || "")
        .join(" ");
    } else if (lastUploadedContent && lastUploadedContent.pages) {
      return lastUploadedContent.pages.map(p => p.text || p.Text || '').join(' ');
    }
    return "";
  };

  // Only Play button, enabled after PDF is loaded (if PDF), or after upload for DOCX
  const handlePlay = () => {
    const combined = getCombinedText();
    if (!combined.trim()) return;
    setTtsContent(combined);
    setShowTTS(true);
    setIsPlaying(true);
    setIsPaused(false);
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new window.SpeechSynthesisUtterance(combined);
      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setShowTTS(false);
      };
      window.speechSynthesis.speak(utterance);
    }
  };

  const handlePause = () => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(true);
    }
  };

  const handleResume = () => {
    if (window.speechSynthesis && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  };

  // TTS: Play/Pause/Resume audio using browser API
  React.useEffect(() => {
    // This effect is only for keeping state in sync if user pauses/resumes via browser controls
    const interval = setInterval(() => {
      if (window.speechSynthesis) {
        if (window.speechSynthesis.speaking && window.speechSynthesis.paused && isPlaying && !isPaused) {
          setIsPaused(true);
        } else if (window.speechSynthesis.speaking && !window.speechSynthesis.paused && (!isPlaying || isPaused)) {
          setIsPlaying(true);
          setIsPaused(false);
        } else if (!window.speechSynthesis.speaking && isPlaying) {
          setIsPlaying(false);
          setIsPaused(false);
        }
      }
    }, 300);
    return () => clearInterval(interval);
  }, [isPlaying, isPaused]);

  // PDF loaded callback
  const handlePdfLoaded = () => {
    setPdfLoaded(true);
  };

  // Play button enabled only after PDF is loaded (if PDF), or after upload for DOCX
  const canPlay = !!lastUploadedContent && ((pdfUrl && pdfLoaded) || (!pdfUrl && lastUploadedContent));

  return (
    <div>
      <FileUploader onFileUpload={handleFileUpload} />
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 16, margin: '16px 0' }}>
        {(!isPlaying || isPaused) && (
          <button
            onClick={isPaused ? handleResume : handlePlay}
            style={{ fontSize: 20, padding: '10px 28px', borderRadius: 50, background: canPlay ? '#4caf50' : '#aaa', color: '#fff', border: 'none', cursor: canPlay ? 'pointer' : 'not-allowed' }}
            disabled={!canPlay}
          >
            ▶ Play
          </button>
        )}
        {isPlaying && !isPaused && (
          <button
            onClick={handlePause}
            style={{ fontSize: 20, padding: '10px 28px', borderRadius: 50, background: '#fbc02d', color: '#fff', border: 'none', cursor: 'pointer' }}
          >
            ❚❚ Pause
          </button>
        )}
      </div>
      {errorMsg && <div style={{ color: 'red', marginBottom: 8 }}>{errorMsg}</div>}
      <PDFViewerArea pdfUrl={pdfUrl} onLoaded={handlePdfLoaded} />
      {/* Only show TTS component if Play is pressed, and do NOT show extracted text box */}
      {/* Optionally, you can keep <TextToSpeech content={ttsContent} /> for highlighting, but browser TTS is handled above */}
    </div>
  );
};

export default UploadPreview;

function normalizeContent(raw) {
  if (!raw) return [];
  if (Array.isArray(raw) && raw.every(item => item && typeof item === 'object' && 'type' in item && 'value' in item)) {
    return raw;
  }
  if (Array.isArray(raw) && raw.every(item => typeof item === 'string')) {
    return raw.map(str => ({ type: 'text', value: str }));
  }
  if (Array.isArray(raw) && raw.every(item => item && (item.text || item.Text))) {
    return raw.map(item => ({ type: 'text', value: item.Text || item.text }));
  }
  if (raw.Pages || raw.pages) {
    const pages = raw.Pages || raw.pages;
    return Array.isArray(pages)
      ? pages.map(p => ({ type: 'text', value: p.Text || p.text || '' }))
      : [];
  }
  if (typeof raw === 'string') {
    return [{ type: 'text', value: raw }];
  }
  if (Array.isArray(raw)) {
    return raw.map(item => ({ type: 'text', value: String(item) }));
  }
  return [];
}