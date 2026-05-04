import { Routes, Route, Link } from 'react-router-dom';
import { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from './context/AuthContext';
import './App.css';
import NotificationBell from './components/NotificationBell';
import { Camera, ScanBarcode, Brain, Scan, BarChart3, BrainCircuit, User as UserIcon, LogOut, Settings } from 'lucide-react';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Coach from './pages/Coach';
import Analytics from './pages/Analytics';

const DEFAULT_AVATAR = '/default-avatar.png';

const Home = () => (
  <main className="main-content">
    <section className="hero animate-fade-in">
      <h1>AI-Powered Nutrition Analyzer</h1>
      <p>Scan food images or barcodes to instantly get nutritional facts and personalized diet recommendations.</p>
      <Link to="/register" className="btn" style={{ display: 'inline-block' }}>Get Started</Link>
    </section>
    
    <section className="glass" style={{ padding: '2rem', marginTop: '2rem', textAlign: 'center' }}>
      <h2>Your Personal Diet Assistant</h2>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        Upload an image of your food and let our AI calculate the calories, proteins, and more.
      </p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
        <div className="glass" style={{ padding: '1.5rem', flex: '1 1 250px' }}>
          <div style={{ marginBottom: '1rem' }}><Camera size={32} color="var(--neon-cyan)" /></div>
          <h3>Food Recognition</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Identify meals and portion sizes using AI.</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', flex: '1 1 250px' }}>
          <div style={{ marginBottom: '1rem' }}><ScanBarcode size={32} color="var(--accent-warning)" /></div>
          <h3>Barcode Scanner</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Instantly lookup packaged foods via barcode.</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', flex: '1 1 250px' }}>
          <div style={{ marginBottom: '1rem' }}><Brain size={32} color="var(--neon-purple)" /></div>
          <h3>Smart Recommendations</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Get feedback based on your fitness goals.</p>
        </div>
      </div>
    </section>
  </main>
);

function App() {
  const { user, logout } = useContext(AuthContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="app-container">
      <header className="header">
        <Link to="/" className="logo">
          nutri<span>Scan</span> <Scan size={24} style={{ marginLeft: '4px' }} />
        </Link>
        
        {user && (
          <nav className="nav-links main-nav" style={{ flex: '1', display: 'flex', justifyContent: 'center' }}>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/analytics" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><BarChart3 size={16} /> Analytics</Link>
            <Link to="/coach" style={{ color: '#a855f7', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}><BrainCircuit size={16} /> Coach</Link>
          </nav>
        )}

        <div className="user-menu" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {user ? (
            <>
              <NotificationBell user={user} />
              {/* Profile Avatar + Dropdown */}
              <div ref={profileRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="profile-avatar-btn"
                  style={{
                    background: 'none',
                    border: '2px solid var(--neon-cyan)',
                    borderRadius: '50%',
                    padding: '2px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    filter: 'drop-shadow(0 0 6px var(--neon-cyan))',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <img
                    src={user.profileImage || DEFAULT_AVATAR}
                    alt="Profile"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                </button>

                {/* Dropdown Menu */}
                {profileOpen && (
                  <div className="profile-dropdown" style={{
                    position: 'absolute',
                    top: 'calc(100% + 10px)',
                    right: 0,
                    background: 'var(--bg-card)',
                    border: '2px solid var(--border-color)',
                    boxShadow: '6px 6px 0px rgba(0,0,0,0.8)',
                    minWidth: '200px',
                    zIndex: 200,
                    overflow: 'hidden',
                  }}>
                    {/* User Info */}
                    <div style={{
                      padding: '1rem',
                      borderBottom: '2px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}>
                      <img
                        src={user.profileImage || DEFAULT_AVATAR}
                        alt="Avatar"
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid var(--neon-cyan)',
                        }}
                      />
                      <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: '0.7rem', color: 'var(--text-primary)' }}>{user.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{user.goal}</div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <Link
                      to="/profile"
                      onClick={() => setProfileOpen(false)}
                      className="profile-dropdown-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.85rem 1rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontFamily: 'var(--font-main)',
                        fontSize: '1.1rem',
                        borderBottom: '1px solid rgba(255,255,255,0.05)',
                        transition: 'background 0.1s',
                      }}
                    >
                      <Settings size={16} color="var(--neon-cyan)" /> Profile Settings
                    </Link>

                    <button
                      onClick={() => { setProfileOpen(false); logout(); }}
                      className="profile-dropdown-item"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.85rem 1rem',
                        color: 'var(--accent-danger)',
                        background: 'none',
                        border: 'none',
                        width: '100%',
                        fontFamily: 'var(--font-main)',
                        fontSize: '1.1rem',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'background 0.1s',
                      }}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn" style={{ padding: '0.5rem 1rem' }}>Sign Up</Link>
            </>
          )}
        </div>
      </header>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/coach" element={<Coach />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </div>
  )
}

export default App;
