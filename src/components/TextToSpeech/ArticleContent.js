import React, { useEffect, useState } from 'react';
import './ArticleContent.css';

const ArticleContent = () => {
  const [docs, setDocs] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(process.env.PUBLIC_URL + '/mock.json')
      .then((res) => res.json())
      .then((data) => setDocs(data))
      .catch((err) => console.error('Failed to load mock.json', err));
  }, []);

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
            <div className="tile" key={doc.Id}>
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
