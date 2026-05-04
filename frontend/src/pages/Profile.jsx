import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Profile = () => {
  const { user, loading, logout } = useContext(AuthContext);

  if (loading) return <div className="main-content" style={{ textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="main-content">
      <div className="glass animate-fade-in" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '1.5rem' }}>Your Profile</h2>
        <div style={{ display: 'grid', gap: '1rem', color: 'var(--text-secondary)' }}>
          <div><strong>Name:</strong> {user.name}</div>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Age:</strong> {user.age || 'Not set'}</div>
          <div><strong>Height:</strong> {user.height ? `${user.height} cm` : 'Not set'}</div>
          <div><strong>Weight:</strong> {user.weight ? `${user.weight} kg` : 'Not set'}</div>
          <div>
            <strong>Goal:</strong> <span style={{ color: 'var(--text-accent)', fontWeight: 'bold' }}>{user.goal}</span>
          </div>
        </div>
        <button onClick={logout} className="btn" style={{ marginTop: '2rem', background: 'var(--accent-danger)' }}>
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
