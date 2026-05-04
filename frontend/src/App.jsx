import { Routes, Route, Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import './App.css';
import NotificationBell from './components/NotificationBell';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Coach from './pages/Coach';
import Analytics from './pages/Analytics';

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
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📷</div>
          <h3>Food Recognition</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Identify meals and portion sizes using AI.</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', flex: '1 1 250px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🔍</div>
          <h3>Barcode Scanner</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Instantly lookup packaged foods via barcode.</p>
        </div>
        <div className="glass" style={{ padding: '1.5rem', flex: '1 1 250px' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🧮</div>
          <h3>Smart Recommendations</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Get feedback based on your fitness goals.</p>
        </div>
      </div>
    </section>
  </main>
);

function App() {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="app-container">
      <header className="header">
        <Link to="/" className="logo">
          nutri<span>Scan</span> 📸
        </Link>
        <nav className="nav-links" style={{ alignItems: 'center' }}>
          {user ? (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/analytics">📊 Analytics</Link>
              <Link to="/coach" style={{ color: '#a855f7', fontWeight: 600 }}>🧠 Coach</Link>
              <NotificationBell user={user} />
              <Link to="/profile">Profile</Link>
              <a href="#" onClick={logout} style={{ color: 'var(--accent-danger)' }}>Logout</a>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className="btn" style={{ padding: '0.5rem 1rem' }}>Sign Up</Link>
            </>
          )}
        </nav>
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
