import React, { useState } from 'react';
import FileUpload from '../components/FileUpload';
import Results from '../components/Results';
import API_BASE_URL from '../apiConfig';

function Home({ onViewChange, setNotification }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('username', localStorage.getItem('userName') || 'Guest');
      
      const response = await fetch(`${API_BASE_URL}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setResults(data);
      if (setNotification) {
        setNotification("Analysis Complete! Context rendered successfully.");
      }
    } catch (error) {
      console.error("Error analyzing file:", error);
      alert("Error connecting to the backend. Please ensure the FastAPI server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-12 py-8 flex flex-col gap-8 flex-grow w-full">
      {!results ? (
        <FileUpload 
          file={file} 
          setFile={setFile} 
          handleUpload={handleUpload} 
          loading={loading} 
          onViewChange={onViewChange}
        />
      ) : (
        <Results results={results} setResults={setResults} />
      )}
    </main>
  );
}

export default Home;
