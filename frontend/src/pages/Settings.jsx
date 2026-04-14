import React, { useEffect, useState } from 'react';
import API_BASE_URL from '../apiConfig';

function Settings() {
  const [plagiarismThreshold, setPlagiarismThreshold] = useState(20);
  const [aiThreshold, setAiThreshold] = useState(30);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/settings`);
        if (response.ok) {
          const data = await response.json();
          setPlagiarismThreshold(data.plagiarism_threshold);
          setAiThreshold(data.ai_threshold);
        }
      } catch (err) {
        console.error("Failed to load settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plagiarism_threshold: parseInt(plagiarismThreshold) || 20,
          ai_threshold: parseInt(aiThreshold) || 30
        })
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-[720px] mx-auto px-12 py-16 flex flex-col gap-8 flex-grow w-full">
      <header>
        <h1 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight mb-2">Institutional Settings</h1>
        <p className="font-body text-xl text-on-surface-variant italic">Configure standard thresholds for manuscript evaluation.</p>
      </header>

      {loading ? (
        <p className="text-on-surface-variant">Loading settings...</p>
      ) : (
        <section className="bg-surface-container-lowest rounded-xl p-8 border border-outline-variant/10 artifact-shadow flex flex-col gap-6">
          
          <div className="flex flex-col gap-2">
            <label className="font-label font-bold text-sm uppercase tracking-wider text-on-primary-fixed">Plagiarism Strictness Threshold (%)</label>
            <p className="font-body text-sm text-on-surface-variant italic mb-2">Analyses scoring above this percentage will trigger an immediate Alert status.</p>
            <input 
              type="number" 
              value={plagiarismThreshold} 
              onChange={(e) => setPlagiarismThreshold(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/30 rounded-md p-3 font-headline font-bold text-lg text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary w-full"
            />
          </div>

          <div className="flex flex-col gap-2 mb-6">
            <label className="font-label font-bold text-sm uppercase tracking-wider text-[#D97706]">AI Content Threshold (%)</label>
            <p className="font-body text-sm text-on-surface-variant italic mb-2">The tolerance level for syntactical AI generated content patterns.</p>
            <input 
              type="number" 
              value={aiThreshold} 
              onChange={(e) => setAiThreshold(e.target.value)}
              className="bg-surface-container-low border border-outline-variant/30 rounded-md p-3 font-headline font-bold text-lg text-on-surface focus:outline-none focus:border-[#D97706] focus:ring-1 focus:ring-[#D97706] w-full"
            />
          </div>
          
          <div className="flex items-center justify-between border-t border-outline-variant/10 pt-6">
            {saved ? (
              <span className="text-[#2D6A4F] font-label font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined">check_circle</span> Saved Successfully
              </span>
            ) : (
              <span></span>
            )}
            <button 
              onClick={handleSave}
              disabled={saving}
              className="signature-gradient text-on-primary px-8 py-3 rounded-md font-headline font-bold hover:shadow-lg active:scale-95 transition-all text-sm w-32 flex justify-center"
            >
              {saving ? 'Saving...' : 'Save Config'}
            </button>
          </div>
        </section>
      )}
    </main>
  );
}

export default Settings;
