import React, { useEffect, useState, useContext } from 'react';
import { UserContext } from '../../Context/UserContext';
import './ArticleContent.css';
// import PDFViewer from './PDFViewer';
import TextToSpeech from './TextToSpeech/TextToSpeech';

const ArticleContent = () => {
  const { user } = useContext(UserContext);
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [presignedUrl, setPresignedUrl] = useState(null);
  const [ttsContent, setTtsContent] = useState(null);
  const [isTtsLoading, setIsTtsLoading] = useState(false);
  const [ttsError, setTtsError] = useState('');
  const [ttsPlayTrigger, setTtsPlayTrigger] = useState(null);
  const [ttsPauseTrigger, setTtsPauseTrigger] = useState(null);
  const [ttsResumeTrigger, setTtsResumeTrigger] = useState(null);
  const [ttsStopTrigger, setTtsStopTrigger] = useState(null);
  const [isTtsPlaying, setIsTtsPlaying] = useState(false);
  const [isTtsPaused, setIsTtsPaused] = useState(false);
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
    setTtsContent(null);
    setTtsError('');
    setTtsPlayTrigger(null);
    setTtsPauseTrigger(null);
    setTtsResumeTrigger(null);
    setTtsStopTrigger(null);
    setIsTtsPlaying(false);
    setIsTtsPaused(false);
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
      setTtsPlayTrigger(null);
      setTtsPauseTrigger(null);
      setTtsResumeTrigger(null);
      setTtsStopTrigger(null);
      setIsTtsPlaying(false);
      setIsTtsPaused(false);
      await fetchTtsContent(doc);
    } catch (err) {
      console.error('Error in handleTileClick:', err);
      alert('Could not load PDF: ' + err.message);
    }
  };

  const fetchTtsContent = async (doc) => {
    if (!doc || !doc.fileName) {
      setTtsContent(null);
      return null;
    }

    setIsTtsLoading(true);
    setTtsError('');
    try {
      const formData = new FormData();
      formData.append('ArticleName', doc.fileName);
      const response = await fetch('https://localhost:7046/api/Article/PdfConvertion', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const details = await response.text();
        throw new Error(details || 'Failed to prepare text-to-speech content.');
      }

      const data = await response.json();
      const rawPages = Array.isArray(data.pages) ? data.pages : [];
      const normalizedPages = rawPages
        .map((page, index) => ({
          PageNumber: page.pageNumber ?? page.PageNumber ?? index + 1,
          Text: (page.text ?? page.Text ?? '').trim(),
        }))
        .filter((page) => page.Text);

      if (!normalizedPages.length) {
        throw new Error('No readable text returned from the document.');
      }

      setTtsContent(normalizedPages);
      return normalizedPages;
    } catch (err) {
      console.error('Failed to prepare text-to-speech content:', err);
      setTtsContent(null);
      setTtsError(err.message || 'Unable to prepare text-to-speech content.');
      setTtsPlayTrigger(null);
      setTtsPauseTrigger(null);
      setTtsResumeTrigger(null);
      setTtsStopTrigger(null);
      setIsTtsPlaying(false);
      setIsTtsPaused(false);
      return null;
    } finally {
      setIsTtsLoading(false);
    }
  };

  const handleBackToLibrary = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setSelectedDoc(null);
    setPresignedUrl(null);
    setTtsContent(null);
    setTtsError('');
    setTtsPlayTrigger(null);
    setTtsPauseTrigger(null);
    setTtsResumeTrigger(null);
    setTtsStopTrigger(null);
    setIsTtsPlaying(false);
    setIsTtsPaused(false);
  };

  const handleStartPlayback = () => {
    if (isTtsLoading) {
      alert('Reader is still preparing the text. Please wait a moment.');
      return;
    }

    if (ttsError) {
      alert('Unable to play this document. Try selecting another one.');
      return;
    }

    if (!ttsContent || !ttsContent.length) {
      alert('No readable content available for this document.');
      return;
    }

    setTtsPauseTrigger(null);
    setTtsResumeTrigger(null);
    setTtsStopTrigger(null);
    setTtsPlayTrigger(Date.now());
  };

  const handlePausePlayback = () => {
    if (!isTtsPlaying || isTtsPaused) {
      return;
    }
    setTtsPauseTrigger(Date.now());
  };

  const handleResumePlayback = () => {
    if (!isTtsPaused) {
      return;
    }
    setTtsResumeTrigger(Date.now());
  };

  const handleStopPlayback = () => {
    if (!isTtsPlaying && !isTtsPaused) {
      return;
    }
    setTtsStopTrigger(Date.now());
  };

  const handlePlaybackStatusChange = (status) => {
    if (status === 'playing') {
      setIsTtsPlaying(true);
      setIsTtsPaused(false);
    } else if (status === 'paused') {
      setIsTtsPlaying(true);
      setIsTtsPaused(true);
    } else {
      setIsTtsPlaying(false);
      setIsTtsPaused(false);
    }
  };

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
          {/* Section 2: Metadata and navigation */}
          <div className="article-section info-section">
            <div className="tile-filename" style={{ fontSize: '1.2rem', marginBottom: 16 }}>{selectedDoc.fileName}</div>
            <button className="play-btn" onClick={handleBackToLibrary} style={{ background: '#1976d2' }}>
              ⟵ Back to Library
            </button>
            {!isTtsPlaying && (
              <button
                className="play-btn"
                onClick={handleStartPlayback}
                style={{ background: '#4caf50', opacity: isTtsLoading || ttsError || !ttsContent ? 0.6 : 1 }}
                disabled={isTtsLoading || Boolean(ttsError) || !ttsContent}
              >
                ▶ Play Article
              </button>
            )}
            {isTtsPlaying && !isTtsPaused && (
              <>
                <button
                  className="play-btn"
                  onClick={handlePausePlayback}
                  style={{ background: '#fbc02d' }}
                >
                  ❚❚ Pause
                </button>
                <button
                  className="play-btn"
                  onClick={handleStopPlayback}
                  style={{ background: '#f44336' }}
                >
                  ■ Stop
                </button>
              </>
            )}
            {isTtsPlaying && isTtsPaused && (
              <>
                <button
                  className="play-btn"
                  onClick={handleResumePlayback}
                  style={{ background: '#4caf50' }}
                >
                  ▶ Resume
                </button>
                <button
                  className="play-btn"
                  onClick={handleStopPlayback}
                  style={{ background: '#f44336' }}
                >
                  ■ Stop
                </button>
              </>
            )}
            {isTtsLoading && (
              <div style={{ color: '#555' }}>Preparing text reader…</div>
            )}
            {ttsError && (
              <div style={{ color: '#d32f2f' }}>{ttsError}</div>
            )}
            {!isTtsLoading && !ttsError && ttsContent && !isTtsPlaying && (
              <div style={{ color: '#4caf50' }}>Ready to play. Use the reader below.</div>
            )}
            {isTtsPlaying && !isTtsPaused && (
              <div style={{ color: '#4caf50' }}>Playing…</div>
            )}
            {isTtsPaused && (
              <div style={{ color: '#fbc02d' }}>Paused. Resume or stop playback.</div>
            )}
          </div>
          {/*
          <div className="article-section pdf-section">
            <PDFViewer documentUrl={presignedUrl} />
          </div>
          */}
        </div>
        <div className="article-tts-section">
          {isTtsLoading && (
            <div className="tts-placeholder">Preparing text-to-speech content…</div>
          )}
          {ttsError && (
            <div className="tts-placeholder" style={{ color: '#d32f2f' }}>{ttsError}</div>
          )}
          {!isTtsLoading && !ttsError && ttsContent && (
            <TextToSpeech
              content={ttsContent}
              autoPlay
              autoPlayTrigger={ttsPlayTrigger}
              pauseTrigger={ttsPauseTrigger}
              resumeTrigger={ttsResumeTrigger}
              stopTrigger={ttsStopTrigger}
              onStatusChange={handlePlaybackStatusChange}
              showControls={false}
              heading={selectedDoc.fileName}
              containerStyle={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}
            />
          )}
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
