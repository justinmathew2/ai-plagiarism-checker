import React, { useRef, useState, useEffect } from 'react';
import API_BASE_URL from '../apiConfig';

function FileUpload({ file, setFile, handleUpload, loading, onViewChange }) {
  const fileInputRef = useRef(null);
  const [recentChecks, setRecentChecks] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const storedName = localStorage.getItem('userName');
      if (!storedName) {
        setLoadingHistory(false);
        setRecentChecks([]);
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/history?username=${encodeURIComponent(storedName)}`);
        if (response.ok) {
          const data = await response.json();
          // show top 2 or 3
          setRecentChecks(data.slice(0, 3));
        }
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoadingHistory(false);
      }
    };
    fetchHistory();
  }, [loading]); // refresh history if loading finishes (after upload)

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 w-full">
      {/* Upload Section */}
      <section className="lg:col-span-7 flex flex-col gap-8">
        <header>
          <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight mb-2">New Analysis</h1>
          <p className="font-body text-xl text-on-surface-variant italic">Upload your manuscript for institutional verification.</p>
        </header>
        
        {/* Drag & Drop Area */}
        <div className="relative group">
          {!file ? (
            <div 
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="bg-surface-container-low rounded-xl border-2 border-dashed border-outline-variant/30 group-hover:border-primary/50 transition-colors p-16 flex flex-col items-center justify-center text-center gap-6 min-h-[400px]"
            >
              <div className="w-20 h-20 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-4xl">upload_file</span>
              </div>
              <div>
                <p className="font-headline font-bold text-xl mb-1">Drag and drop your file here</p>
                <p className="font-label text-on-surface-variant">Supported formats: PDF, DOCX, TXT</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleChange} 
                accept=".pdf,.docx,.txt"
                className="hidden" 
              />
              <button 
                onClick={() => fileInputRef.current.click()}
                className="signature-gradient text-on-primary px-8 py-3 rounded-md font-label font-medium flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
              >
                Browse Files
              </button>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-xl border-2 border-primary transition-colors p-16 flex flex-col items-center justify-center text-center gap-6 min-h-[400px]">
              <div className="w-20 h-20 rounded-full bg-surface-container-low flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-4xl">description</span>
              </div>
              <div>
                <p className="font-headline font-bold text-xl mb-1">{file.name}</p>
                <p className="font-label text-on-surface-variant">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button 
                onClick={() => setFile(null)}
                className="text-error px-4 py-2 rounded-md font-label font-medium flex items-center gap-2 hover:bg-error-container/20 transition-all"
              >
                Remove File
              </button>
            </div>
          )}
        </div>
        
        <div className="flex justify-end mt-4">
          <button 
            onClick={handleUpload}
            disabled={!file || loading}
            className={`signature-gradient text-on-primary px-12 py-4 rounded-md font-headline font-extrabold text-lg flex items-center gap-3 shadow-lg hover:shadow-xl transition-all active:scale-95 
              ${(!file || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Processing...' : 'Analyze Now'}
            <span className="material-symbols-outlined">auto_awesome</span>
          </button>
        </div>
      </section>

      {/* Sidebar: Recent History */}
      <aside className="lg:col-span-5 flex flex-col gap-6">
        <div className="bg-surface-container-low rounded-xl p-8 h-full">
          <div className="flex justify-between items-center mb-8">
            <h2 className="font-headline font-bold text-xl text-on-surface">Recent Artifacts</h2>
            <a 
              className="text-primary font-label text-sm font-semibold hover:underline cursor-pointer" 
              onClick={(e) => { e.preventDefault(); onViewChange('history'); }}
            >
              View All
            </a>
          </div>
          <div className="flex flex-col gap-4">
            {loadingHistory ? (
              <p className="text-sm text-on-surface-variant">Loading recently checked documents...</p>
            ) : recentChecks.length === 0 ? (
              <p className="text-sm text-on-surface-variant">No recent checks found.</p>
            ) : (
              recentChecks.map((check) => (
                <div key={check.id} className="bg-surface-container-lowest p-5 rounded-lg flex items-center justify-between transition-transform hover:-translate-y-1 cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-surface-container rounded flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined">article</span>
                    </div>
                    <div className="truncate max-w-[150px]">
                      <h3 className="font-headline font-bold text-sm text-on-surface truncate" title={check.filename}>{check.filename}</h3>
                      <p className="font-label text-xs text-on-surface-variant">{new Date(check.timestamp).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`font-headline font-extrabold text-lg ${check.plagiarism_score > 20 ? 'text-error' : 'text-[#2D6A4F]'}`}>
                      {check.plagiarism_score}%
                    </span>
                    <span className={`font-label text-[10px] uppercase tracking-widest ${check.plagiarism_score > 20 ? 'text-error/80' : 'text-[#2D6A4F]/80'}`}>
                      {check.plagiarism_score > 20 ? 'Alert' : 'Safe'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
          {/* Trust Indicator Bento */}
          <div className="mt-auto pt-8">
            <div className="bg-surface-dim/40 rounded-xl p-6 border border-outline-variant/10">
              <div className="flex items-start gap-4">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                <div>
                  <p className="font-headline font-bold text-sm text-on-surface mb-1">Institutional Integrity</p>
                  <p className="font-body text-sm text-on-surface-variant italic leading-relaxed">
                    Your documents are processed through our private academic vault and are never shared with third-party databases.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default FileUpload;
