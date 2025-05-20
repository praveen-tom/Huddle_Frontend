import React, { useEffect, useState } from 'react';
import './ArticleContent.css';
import PDFViewer from './PDFViewer';

const ArticleContent = () => {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [presignedUrl, setPresignedUrl] = useState(null);

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/mock.json')
      .then((res) => res.json())
      .then((data) => setDocs(data))
      .catch((err) => console.error('Failed to load mock.json', err));
  }, []);

  const handleTileClick = async (doc) => {
    setSelectedDoc(null);
    setPresignedUrl(null);
    try {
      console.log('Requesting presigned URL for:', doc.ObjectKey);
      // Use ObjectKey for the API, not FileName
      const res = await fetch(`https://localhost:7046/api/Article/GetPresignedPdfUrl?fileKey=${encodeURIComponent(doc.ObjectKey)}`);
      console.log('Presigned URL response status:', res.status);
      if (!res.ok) {
        const text = await res.text();
        console.error('Failed to get PDF URL. Response:', text);
        throw new Error('Failed to get PDF URL');
      }
      const data = await res.json();
      console.log('Presigned URL data:', data);
      setSelectedDoc(doc);
      setPresignedUrl(data.url); // Use the presigned URL from the API response
    } catch (err) {
      console.error('Error in handleTileClick:', err);
      alert('Could not load PDF: ' + err.message);
    }
  };

  if (selectedDoc && presignedUrl) {
    return (
      <div className="article-details-container">
        <div className="article-details-inner">
          {/* Section 1: Image */}
          <div className="article-section image-section">
            <img src={selectedDoc.ThumbnailImage} alt={selectedDoc.FileName} className="tile-thumbnail" style={{ width: 200, height: 240 }} />
          </div>
          {/* Section 2: Filename and Play Button */}
          <div className="article-section info-section">
            <div className="tile-filename" style={{ fontSize: '1.2rem', marginBottom: 16 }}>{selectedDoc.FileName}</div>
            <button className="play-btn">
              ▶ Play
            </button>
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
        >
          Upload Article
        </button>
      </div>
      <div className="tiles-grid">
        {docs
          .filter((doc) => doc.FileName.toLowerCase().includes(search.toLowerCase()))
          .map((doc) => (
            <div className="tile" key={doc.Id} onClick={() => handleTileClick(doc)} style={{ cursor: 'pointer' }}>
              <img
                src={doc.ThumbnailImage}
                alt={doc.FileName}
                className="tile-thumbnail"
              />
              <div className="tile-filename">{doc.FileName}</div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default ArticleContent;
