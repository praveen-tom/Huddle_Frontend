import React, { useEffect, useState, useRef, useCallback, useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import './ArticleContent.css';
import PDFViewer from './PDFViewer';

const ArticleContent = () => {
  const { user } = useContext(UserContext);
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [ttsUtterance, setTtsUtterance] = useState(null);
  const ttsRef = useRef(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState('');

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const response = await fetch('https://localhost:7046/api/Article/AllHeapDocuments');
        if (!response.ok) {
          throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }
        const result = await response.json();
        // Support both { status, data } and plain array
        let docsArray = Array.isArray(result) ? result : result.data || [];
        if (!Array.isArray(docsArray)) {
          throw new Error("Invalid API response format for documents.");
        }
        setDocs(docsArray);
      } catch (err) {
        console.error("Failed to fetch heap documents:", err.message);
        setDocs([]);
      }
    };
    fetchDocs();
  }, []);

  const handleTileClick = async (doc) => {
    setSelectedDoc(null);
    setPresignedUrl(null);
    try {
      // Use fileName instead of objectKey for presigned URL
      const fileKey = doc.fileName;
      if (!fileKey) {
        alert('No file name found for this document.');
        return;
      }
      console.log('Requesting presigned URL for fileName:', fileKey);
      const res = await fetch(`https://localhost:7046/api/Article/GetPresignedPdfUrl?fileKey=${encodeURIComponent(fileKey)}`);
      console.log('Presigned URL response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        console.error('Failed to get PDF URL. Response:', text);
        throw new Error('Failed to get PDF URL');
      }
      const data = await res.json();
      console.log('Presigned URL data:', data);
      setSelectedDoc(doc);
      setPresignedUrl(data.url);
    } catch (err) {
      console.error('Error in handleTileClick:', err);
      alert('Could not load PDF: ' + err.message);
    }
  };

  // Extract text from selectedDoc (prefer Pages array)
  const getDocText = (doc) => {
    if (doc.Pages && Array.isArray(doc.Pages) && doc.Pages.length > 0) {
      return doc.Pages.map(p => p.text || p.Text || '').join(' ');
    }
    return doc.Text || doc.Content || doc.FileName || '';
  };

  // Helper to highlight a word in the PDF text layer
  const highlightPDFWord = (word) => {
    // Find all spans in the text layer
    const spans = document.querySelectorAll('.react-pdf__Page__textContent span');
    let found = false;
    for (let span of spans) {
      // Remove previous highlight
      span.style.background = '';
      // Compare text content (case-insensitive, trimmed)
      if (!found && span.textContent && span.textContent.trim().replace(/\s+/g, ' ') === word.trim().replace(/\s+/g, ' ')) {
        span.style.background = '#ffe082';
        found = true;
      }
    }
  };

  const clearPDFHighlights = () => {
    const spans = document.querySelectorAll('.react-pdf__Page__textContent span');
    for (let span of spans) {
      span.style.background = '';
    }
  };

  const handlePlay = () => {
    if (!selectedDoc) return;
    const text = getDocText(selectedDoc);
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    if (!text.trim()) {
      alert('No text to read.');
      return;
    }
    window.speechSynthesis.cancel();
    clearPDFHighlights();
    const words = text.split(/\s+/).filter(Boolean);
    let wordIdx = 0;
    const utterance = new window.SpeechSynthesisUtterance(text);
    utterance.onboundary = (event) => {
      if (event.name === 'word' && event.charIndex !== undefined) {
        // Find the word being spoken by char index
        let charCount = 0;
        for (let i = 0; i < words.length; i++) {
          charCount += words[i].length + 1; // +1 for space
          if (charCount > event.charIndex) {
            wordIdx = i;
            break;
          }
        }
        highlightPDFWord(words[wordIdx] || '');
      }
    };
    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setTtsUtterance(null);
      clearPDFHighlights();
    };
    utterance.onerror = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setTtsUtterance(null);
      clearPDFHighlights();
    };
    setTtsUtterance(utterance);
    ttsRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      setIsPlaying(true);
    }
  };

  const handleResume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setTtsUtterance(null);
    clearPDFHighlights();
  };

  // Keep state in sync if user uses browser controls
  useEffect(() => {
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

  const handleUploadClick = () => {
    console.log('Upload Article button clicked');
    setShowUploadModal(true);
    setSelectedFile(null);
    setUploadError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    console.log('File selected:', file);
    if (!file) {
      setSelectedFile(null);
      setUploadError('');
      return;
    }
    if (file.type !== 'application/pdf') {
      setUploadError('Only PDF files are allowed.');
      setSelectedFile(null);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setUploadError('File size must be less than 10MB.');
      setSelectedFile(null);
      return;
    }
    setSelectedFile(file);
    setUploadError('');
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    console.log('Upload submit clicked');
    if (!selectedFile) {
      setUploadError('Please select a PDF file.');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (user && user.id) {
        formData.append('coachId', user.id);
      }
      const response = await fetch('https://localhost:7046/api/Article/PdfToJson', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        const text = await response.text();
        setUploadError('Upload failed: ' + text);
        return;
      }
      const data = await response.json();
      alert('PDF uploaded and parsed! Page count: ' + data.PageCount);
      // Optionally: add to docs, close modal, etc.
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadError('');
    } catch (err) {
      setUploadError('Upload error: ' + err.message);
    }
  };

  // Upload PDF to PdfConvertion API and show in viewer (for preview, not saving)
  const handlePdfConvertionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setUploadError('Please select a PDF file.');
      return;
    }
    try {
      // Use GET request with ArticleName as query param (per backend expectation)
      const articleName = encodeURIComponent(selectedFile.name);
      const response = await fetch(`https://localhost:7046/api/Article/PdfConvertion?ArticleName=${articleName}`);
      if (!response.ok) {
        const text = await response.text();
        setUploadError('Preview failed: ' + text);
        return;
      }
      const data = await response.json();
      setShowUploadModal(false);
      setSelectedFile(null);
      setUploadError('');
      setSelectedDoc({
        fileName: selectedFile.name,
        thumbnailImage: null,
        id: 'uploaded-preview',
        objectKey: null,
      });
      setPresignedUrl(data.url);
    } catch (err) {
      setUploadError('Preview error: ' + err.message);
    }
  };

  const handleCloseModal = () => {
    console.log('Upload modal closed');
    setShowUploadModal(false);
    setSelectedFile(null);
    setUploadError('');
  };

  // Update PDF details view to use correct property names
  if (selectedDoc && presignedUrl) {
    return (
      <div className="article-details-container">
        <div className="article-details-inner">
          {/* Section 1: Image */}
          <div className="article-section image-section">
            {selectedDoc.thumbnailImage ? (
              <img src={selectedDoc.thumbnailImage} alt={selectedDoc.fileName} className="tile-thumbnail" style={{ width: 200, height: 240 }} />
            ) : (
              <div className="tile-thumbnail" style={{ width: 200, height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e0e0', color: '#555', fontWeight: 600, fontSize: '0.95rem' }}>{selectedDoc.fileName}</div>
            )}
          </div>
          {/* Section 2: Filename and Play/Pause/Stop Buttons */}
          <div className="article-section info-section">
            <div className="tile-filename" style={{ fontSize: '1.2rem', marginBottom: 16 }}>{selectedDoc.fileName}</div>
            {(!isPlaying || isPaused) && (
              <button className="play-btn" onClick={isPaused ? handleResume : handlePlay}>
                ▶ {isPaused ? 'Resume' : 'Play'}
              </button>
            )}
            {isPlaying && !isPaused && (
              <button className="play-btn" style={{ background: '#fbc02d' }} onClick={handlePause}>
                ❚❚ Pause
              </button>
            )}
            {isPlaying && (
              <button className="play-btn" style={{ background: '#f44336', marginLeft: 8 }} onClick={handleStop}>
                ■ Stop
              </button>
            )}
          </div>
          {/* Section 3: PDF Viewer */}
          <div className="article-section pdf-section">
            <PDFViewer documentUrl={presignedUrl} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="upload-content-container">
      {/* Upload Modal */}
      {showUploadModal && (
        <>
          <div className="modal-backdrop" onClick={handleCloseModal}></div>
          <div className="popup">
            <div className="popup-content">
              <h3>Upload PDF Article</h3>
              <form onSubmit={handleUploadSubmit}>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  style={{ marginBottom: 12 }}
                />
                {uploadError && (
                  <div style={{ color: 'red', marginBottom: 8 }}>{uploadError}</div>
                )}
                <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                  <button type="submit" className="play-btn" style={{ background: '#4caf50' }}>
                    Upload
                  </button>
                  <button type="button" className="play-btn" style={{ background: '#aaa' }} onClick={handleCloseModal}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by filename..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-bar"
          style={{
            width: '100%',
            padding: '0.75rem',
            fontSize: '1rem',
            borderRadius: 6,
            border: '1px solid #ccc',
          }}
        />
        <button
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            borderRadius: 6,
            border: 'none',
            background: '#4caf50',
            color: '#fff',
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
          onClick={handleUploadClick}
        >
          Upload Article
        </button>
      </div>
      <div className="tiles-grid">
        {docs
          .filter((doc) => doc.fileName && doc.fileName.toLowerCase().includes(search.toLowerCase()))
          .map((doc) => (
            <div className="tile" key={doc.id} onClick={() => handleTileClick(doc)} style={{ cursor: 'pointer' }}>
              {doc.thumbnailImage ? (
                <img
                  src={doc.thumbnailImage}
                  alt={doc.fileName}
                  className="tile-thumbnail"
                />
              ) : (
                <div className="tile-thumbnail" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e0e0e0', color: '#555', fontWeight: 600, fontSize: '0.95rem' }}>
                  {doc.fileName}
                </div>
              )}
              <div className="tile-filename">{doc.fileName}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ArticleContent;
