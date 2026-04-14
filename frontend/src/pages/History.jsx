import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../apiConfig';

function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      const storedName = localStorage.getItem('userName');
      if (!storedName) {
        setLoading(false);
        setHistory([]);
        return;
      }
      
      try {
        const response = await fetch(`${API_BASE_URL}/history?username=${encodeURIComponent(storedName)}`);
        if (response.ok) {
          const data = await response.json();
          setHistory(data);
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear all analysis history?")) return;
    
    try {
      const username = localStorage.getItem('userName') || 'Guest';
      const response = await fetch(`${API_BASE_URL}/history?username=${encodeURIComponent(username)}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setHistory([]);
      }
    } catch (err) {
      console.error("Failed to clear history", err);
    }
  };

  return (
    <main className="max-w-[1440px] mx-auto px-12 py-8 flex flex-col gap-8 flex-grow w-full">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight mb-2">Artifact History</h1>
          <p className="font-body text-xl text-on-surface-variant italic">Review past analyses and manuscript verifications.</p>
        </div>
        {history.length > 0 && (
          <button 
            onClick={handleClearHistory}
            className="text-error font-label font-bold text-sm flex items-center gap-2 hover:bg-error-container/20 px-4 py-2 rounded-md transition-colors"
          >
            <span className="material-symbols-outlined text-sm">delete</span>
            Clear History
          </button>
        )}
      </header>

      <section className="bg-surface-container-low rounded-xl p-8 flex flex-col gap-4">
        {loading ? (
          <p className="text-on-surface-variant">Loading records...</p>
        ) : history.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-outline-variant/50 mb-4 block">history</span>
            <p className="font-headline text-xl text-on-surface-variant font-bold">No records found</p>
            <p className="font-label text-sm text-outline">Upload a manuscript to view its analysis here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant/20">
                  <th className="py-4 px-4 font-headline text-sm font-bold text-on-surface">Filename</th>
                  <th className="py-4 px-4 font-headline text-sm font-bold text-on-surface">Date</th>
                  <th className="py-4 px-4 font-headline text-sm font-bold text-on-surface text-right">Plagiarism Score</th>
                  <th className="py-4 px-4 font-headline text-sm font-bold text-on-surface text-right">AI Score</th>
                  <th className="py-4 px-4 font-headline text-sm font-bold text-on-surface text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id} className="border-b border-outline-variant/10 hover:bg-surface-container-high transition-colors">
                    <td className="py-4 px-4 font-label text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">article</span>
                        {record.filename}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-label text-sm text-on-surface-variant">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td className="py-4 px-4 font-headline font-extrabold text-lg text-right">
                      {record.plagiarism_score}%
                    </td>
                    <td className="py-4 px-4 font-headline font-extrabold text-lg text-right text-[#D97706]">
                      {record.ai_score}%
                    </td>
                    <td className="py-4 px-4 text-center">
                       {record.plagiarism_score > 20 ? (
                         <span className="bg-error-container text-on-error-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Alert</span>
                       ) : (
                         <span className="bg-primary-container text-on-primary-container px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Reviewing</span>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

export default History;
