import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../App.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    height: '',
    weight: '',
    goal: 'Maintenance',
    profileImage: '',
  });
  const [error, setError] = useState('');
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to ~1MB since we store in MongoDB)
      if (file.size > 1024 * 1024) {
        setError('Image size must be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const res = await register(formData);
    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '2rem 0' }}>
      <div className="glass animate-fade-in" style={{ padding: '2.5rem', width: '100%', maxWidth: '500px' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', background: 'linear-gradient(135deg, var(--text-accent), #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Create an Account
        </h2>
        
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', border: '1px solid var(--accent-danger)', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label htmlFor="name" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Full Name</label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="glass" style={inputStyle} placeholder="John Doe" />
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label htmlFor="email" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Email</label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="glass" style={inputStyle} placeholder="you@example.com" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="password" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Password</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required className="glass" style={inputStyle} placeholder="••••••••" />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label htmlFor="age" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Age</label>
              <input type="number" id="age" name="age" value={formData.age} onChange={handleChange} className="glass" style={inputStyle} placeholder="e.g. 25" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label htmlFor="height" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Height (cm)</label>
              <input type="number" id="height" name="height" value={formData.height} onChange={handleChange} className="glass" style={inputStyle} placeholder="e.g. 175" />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
              <label htmlFor="weight" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Weight (kg)</label>
              <input type="number" id="weight" name="weight" value={formData.weight} onChange={handleChange} className="glass" style={inputStyle} placeholder="e.g. 70" />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="goal" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Fitness Goal</label>
            <select id="goal" name="goal" value={formData.goal} onChange={handleChange} className="glass" style={{ ...inputStyle, cursor: 'pointer' }}>
              <option value="Maintenance">Maintenance</option>
              <option value="Cutting">Cutting</option>
              <option value="Bulking">Bulking</option>
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <label htmlFor="profileImage" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Profile Image (Optional)</label>
            <input type="file" id="profileImage" name="profileImage" accept="image/*" onChange={handleImageChange} className="glass" style={inputStyle} />
            {formData.profileImage && (
              <div style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                <img src={formData.profileImage} alt="Profile Preview" style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--neon-cyan)' }} />
              </div>
            )}
          </div>

          <button type="submit" className="btn" style={{ marginTop: '0.5rem', width: '100%' }}>
            Sign Up
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent-primary)', fontWeight: '600' }}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const inputStyle = {
  padding: '0.75rem',
  borderRadius: '0.5rem',
  background: 'rgba(0,0,0,0.4)',
  color: 'white',
  outline: 'none',
  border: '1px solid var(--border-color)',
  width: '100%',
  transition: 'box-shadow 0.3s ease, border-color 0.3s ease',
};

export default Register;
