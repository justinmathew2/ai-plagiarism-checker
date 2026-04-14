import React, { useState, useEffect } from 'react';
import Home from './pages/Home';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  const [currentView, setCurrentView] = useState('home');
  const [userName, setUserName] = useState(localStorage.getItem('userName') || '');
  const [showNameModal, setShowNameModal] = useState(!localStorage.getItem('userName'));
  const [tempName, setTempName] = useState('');
  
  // Notification States
  const [notification, setNotification] = useState(null); // Toast
  const [notificationList, setNotificationList] = useState([]); // List for bell dropdown
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (notification) {
      setNotificationList(prev => [{ id: Date.now(), msg: notification, unread: true }, ...prev]);
      
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const markAsRead = () => {
    setNotificationList(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const hasUnread = notificationList.some(n => n.unread);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (tempName.trim()) {
      setUserName(tempName.trim());
      localStorage.setItem('userName', tempName.trim());
      setShowNameModal(false);
    }
  };

  return (
    <>
      {showNameModal && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-surface-container-lowest p-8 rounded-2xl artifact-shadow max-w-sm w-full mx-4 border border-outline-variant/20">
            <h2 className="font-headline text-2xl font-extrabold text-on-surface mb-2">Welcome to JustInSight!</h2>
            <p className="font-body text-sm text-on-surface-variant mb-6">Let's personalize your experience. How should we address you?</p>
            <form onSubmit={handleNameSubmit} className="flex flex-col gap-4">
              <input 
                type="text" 
                placeholder="Enter your name..." 
                className="bg-surface-container w-full p-3 rounded-lg border border-outline-variant focus:outline-none focus:border-primary text-on-surface font-label"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                autoFocus
              />
              <button 
                type="submit" 
                className="signature-gradient text-on-primary font-bold py-3 rounded-lg shadow-md hover:opacity-90 transition-opacity"
              >
                Get Started
              </button>
            </form>
          </div>
        </div>
      )}

      {notification && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-[90] bg-primary-container text-on-primary-container px-6 py-3 rounded-full shadow-lg border border-primary/20 flex items-center gap-3 animate-fade-in">
          <span className="material-symbols-outlined text-sm">check_circle</span>
          <span className="font-label font-bold text-sm tracking-wide">{notification}</span>
        </div>
      )}
      <header className="w-full top-0 sticky z-50 bg-[#f0f4f7] dark:bg-slate-900 no-border">
        <div className="flex justify-between items-center w-full px-12 py-4 max-w-[1440px] mx-auto">
          <div className="flex items-center gap-12">
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentView('home'); }} className="flex items-center">
              <img src="/logo.png" alt="JustInSight AI" className="h-10 w-auto" />
            </a>
            <nav className="hidden md:flex items-center gap-8 font-['Manrope'] font-bold tracking-tight">
              <a 
                onClick={(e) => { e.preventDefault(); setCurrentView('home'); }}
                className={`pb-1 transition-colors cursor-pointer ${currentView === 'home' ? 'text-[#515f74] dark:text-white border-b-2 border-[#515f74]' : 'text-[#515f74]/60 dark:text-slate-400 hover:text-[#2a3439] dark:hover:text-white'}`} 
              >
                Home
              </a>
              <a 
                onClick={(e) => { e.preventDefault(); setCurrentView('history'); }}
                className={`pb-1 transition-colors cursor-pointer ${currentView === 'history' ? 'text-[#515f74] dark:text-white border-b-2 border-[#515f74]' : 'text-[#515f74]/60 dark:text-slate-400 hover:text-[#2a3439] dark:hover:text-white'}`} 
              >
                History
              </a>
              <a 
                onClick={(e) => { e.preventDefault(); setCurrentView('settings'); }}
                className={`pb-1 transition-colors cursor-pointer ${currentView === 'settings' ? 'text-[#515f74] dark:text-white border-b-2 border-[#515f74]' : 'text-[#515f74]/60 dark:text-slate-400 hover:text-[#2a3439] dark:hover:text-white'}`} 
              >
                Settings
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-6 relative">
            <div className="relative">
              <span 
                onClick={() => {
                  setShowDropdown(!showDropdown);
                  if (!showDropdown) markAsRead();
                }}
                className="material-symbols-outlined text-[#475569] dark:text-slate-300 cursor-pointer scale-95 duration-150 ease-in-out hover:text-[#2a3439] select-none"
              >
                notifications
              </span>
              {hasUnread && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-error rounded-full pointer-events-none"></span>
              )}
              
              {/* Notifications Dropdown */}
              {showDropdown && (
                <div className="absolute top-10 right-0 w-80 bg-surface-container-lowest artifact-shadow rounded-xl border border-outline-variant/20 flex flex-col overflow-hidden z-[100]">
                  <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant/20 flex justify-between items-center">
                    <span className="font-headline font-bold text-on-surface text-sm">Notifications</span>
                    <span className="text-xs text-on-surface-variant cursor-pointer hover:text-primary" onClick={() => setNotificationList([])}>Clear</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notificationList.length === 0 ? (
                      <div className="py-8 text-center text-on-surface-variant font-body text-sm">
                        No notifications right now.
                      </div>
                    ) : (
                      notificationList.map((notif) => (
                        <div key={notif.id} className="p-4 border-b border-outline-variant/10 text-sm font-body text-on-surface hover:bg-surface-container/50 transition-colors">
                          <div className="flex gap-3 items-start">
                            <span className="material-symbols-outlined text-primary text-lg">info</span>
                            <p>{notif.msg}</p>
                          </div>
                          <span className="text-[10px] text-on-surface-variant block text-right mt-1">
                            {new Date(notif.id).toLocaleTimeString()}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="relative group flex items-center gap-3">
              <div className="hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="font-label text-sm text-on-surface-variant font-bold">Hello, {userName || 'Researcher'}!</span>
              </div>
              <img
                alt="Academic Researcher Profile"
                className="w-10 h-10 rounded-full border border-outline-variant/20 shadow-sm cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCiwCGxtRD6LI4oZqPcrbDkE8Q-BjdWtaRcxa_9nZACVxUVav6OiGf3oj13urCPZa4rYUFl-uQl8_qAsLqro8hMbdYJWZaFZut3l5lAkEB46Yf1tcjTj5ib2-kEjanhYK5jv-JP36eERSFxp25lNhmq4vDB4pALNVo-hf7l_0nBxsWp_nx3j22YDv1_lkGWEN-hg_I5iD60wcoVn781nDUUal8X-iMKmvkhannfZNEfzM1JvvjftPs5mt8dz4n889wEpBuPvPNj4pQ"
                title={`Hello, ${userName || 'Researcher'}!`}
              />
            </div>
          </div>
        </div>
      </header>

      {currentView === 'home' && <Home onViewChange={setCurrentView} setNotification={setNotification} />}
      {currentView === 'history' && <History />}
      {currentView === 'settings' && <Settings />}

      <footer className="w-full mt-auto bg-[#cfdce3] dark:bg-slate-800">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 py-8 w-full max-w-[1440px] mx-auto">
          <div className="mb-4 md:mb-0">
            <img src="/logo.png" alt="JustInSight AI" className="h-8 w-auto mb-2 opacity-80" />
            <p className="font-['Inter'] text-sm tracking-wide text-[#475569]/80 dark:text-slate-400 mt-1">
              © 2026 JustInSight AI. Enhancing Academic Integrity with AI.
            </p>
          </div>
          <nav className="flex gap-8 font-['Inter'] text-sm tracking-wide items-center">
            <span className="text-[#475569] dark:text-slate-400 opacity-80 flex items-center gap-1 cursor-default" title="Your data is strictly processed via secure infrastructure and never permanently stored beyond your session.">
              <span className="material-symbols-outlined text-[16px]">lock</span>
              Data is Safe & Secure
            </span>
            <a className="text-[#475569] dark:text-slate-400 no-underline hover:text-[#primary] dark:hover:text-slate-200 transition-colors opacity-80 hover:opacity-100 flex items-center gap-1" href="https://www.linkedin.com/in/justin-p-mathew/" target="_blank" rel="noopener noreferrer">
              Contact Support
            </a>
          </nav>
        </div>
      </footer>
    </>
  );
}

export default App;
