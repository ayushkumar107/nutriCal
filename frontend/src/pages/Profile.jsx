import { useContext, useState, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { Camera, Save, X, User, Mail, Ruler, Weight, Target, Calendar, Lock, CheckCircle } from 'lucide-react';

const DEFAULT_AVATAR = '/default-avatar.png';

const Profile = () => {
  const { user, loading, logout, refreshUser } = useContext(AuthContext);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    name: '',
    age: '',
    height: '',
    weight: '',
    goal: '',
    password: '',
    profileImage: '',
  });

  const startEditing = () => {
    setForm({
      name: user.name || '',
      age: user.age || '',
      height: user.height || '',
      weight: user.weight || '',
      goal: user.goal || 'Maintenance',
      password: '',
      profileImage: user.profileImage || '',
    });
    setEditing(true);
    setSuccess('');
    setError('');
  };

  const cancelEditing = () => {
    setEditing(false);
    setError('');
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 1024 * 1024) {
      setError('Image must be less than 1MB');
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, profileImage: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        name: form.name,
        age: Number(form.age) || undefined,
        height: Number(form.height) || undefined,
        weight: Number(form.weight) || undefined,
        goal: form.goal,
        profileImage: form.profileImage,
      };
      // Only include password if the user typed one
      if (form.password.trim()) {
        payload.password = form.password;
      }

      await axios.put('auth/profile', payload);
      await refreshUser();
      setEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="main-content" style={{ textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const avatarSrc = editing ? (form.profileImage || DEFAULT_AVATAR) : (user.profileImage || DEFAULT_AVATAR);

  return (
    <div className="main-content">
      <div className="glass animate-fade-in" style={{ padding: '2.5rem', maxWidth: '600px', margin: '0 auto' }}>

        {/* Avatar Section */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ position: 'relative', marginBottom: '1rem' }}>
            <img
              src={avatarSrc}
              alt="Profile"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--neon-cyan)',
                filter: 'drop-shadow(0 0 8px var(--neon-cyan))',
              }}
            />
            {editing && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: 'var(--accent-primary)',
                  border: '2px solid #000',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '2px 2px 0px #000',
                }}
              >
                <Camera size={16} color="white" />
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: 'none' }}
            />
          </div>
          <h2 style={{ marginBottom: '0.25rem', fontSize: '1.2rem' }}>{user.name}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 }}>{user.email}</p>
        </div>

        {/* Success / Error Messages */}
        {success && (
          <div style={{
            background: 'rgba(57, 255, 20, 0.1)',
            border: '2px solid var(--accent-success)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            color: 'var(--accent-success)',
            fontFamily: 'var(--font-main)',
            fontSize: '1.1rem',
          }}>
            <CheckCircle size={18} /> {success}
          </div>
        )}
        {error && (
          <div style={{
            background: 'rgba(255, 0, 51, 0.1)',
            border: '2px solid var(--accent-danger)',
            padding: '0.75rem 1rem',
            marginBottom: '1.5rem',
            color: '#fca5a5',
            fontFamily: 'var(--font-main)',
            fontSize: '1.1rem',
          }}>
            {error}
          </div>
        )}

        {/* View Mode */}
        {!editing ? (
          <>
            <div style={{ display: 'grid', gap: '1rem' }}>
              {[
                { icon: <User size={16} color="var(--neon-cyan)" />, label: 'Name', value: user.name },
                { icon: <Mail size={16} color="var(--neon-cyan)" />, label: 'Email', value: user.email },
                { icon: <Calendar size={16} color="var(--neon-cyan)" />, label: 'Age', value: user.age || 'Not set' },
                { icon: <Ruler size={16} color="var(--neon-cyan)" />, label: 'Height', value: user.height ? `${user.height} cm` : 'Not set' },
                { icon: <Weight size={16} color="var(--neon-cyan)" />, label: 'Weight', value: user.weight ? `${user.weight} kg` : 'Not set' },
                { icon: <Target size={16} color="var(--neon-cyan)" />, label: 'Goal', value: user.goal, highlight: true },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.85rem 1rem',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  {item.icon}
                  <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-heading)', fontSize: '0.65rem', minWidth: '70px' }}>{item.label}</span>
                  <span style={{ color: item.highlight ? 'var(--text-accent)' : 'var(--text-primary)', fontWeight: item.highlight ? 800 : 400, fontSize: '1.1rem' }}>{item.value}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button onClick={startEditing} className="btn" style={{ flex: 1 }}>
                Edit Profile
              </button>
              <button onClick={logout} className="btn" style={{ flex: 1, background: 'var(--accent-danger)' }}>
                Logout
              </button>
            </div>
          </>
        ) : (
          /* Edit Mode */
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* Name */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={{ fontSize: '0.7rem', fontFamily: 'var(--font-heading)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <User size={12} /> NAME
              </label>
              <input type="text" name="name" value={form.name} onChange={handleChange} required style={inputStyle} />
            </div>

            {/* Age / Height / Weight */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={labelStyle}><Calendar size={12} /> AGE</label>
                <input type="number" name="age" value={form.age} onChange={handleChange} style={inputStyle} placeholder="25" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={labelStyle}><Ruler size={12} /> HEIGHT (CM)</label>
                <input type="number" name="height" value={form.height} onChange={handleChange} style={inputStyle} placeholder="175" />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={labelStyle}><Weight size={12} /> WEIGHT (KG)</label>
                <input type="number" name="weight" value={form.weight} onChange={handleChange} style={inputStyle} placeholder="70" />
              </div>
            </div>

            {/* Goal */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={labelStyle}><Target size={12} /> FITNESS GOAL</label>
              <select name="goal" value={form.goal} onChange={handleChange} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="Maintenance">Maintenance</option>
                <option value="Cutting">Cutting</option>
                <option value="Bulking">Bulking</option>
              </select>
            </div>

            {/* New Password (optional) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <label style={labelStyle}><Lock size={12} /> NEW PASSWORD (OPTIONAL)</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} style={inputStyle} placeholder="Leave blank to keep current" />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} disabled={saving}>
                <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button type="button" onClick={cancelEditing} className="btn" style={{ flex: 1, background: 'var(--bg-card)', border: '2px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <X size={16} /> Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

const labelStyle = {
  fontSize: '0.65rem',
  fontFamily: 'var(--font-heading)',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
};

const inputStyle = {
  padding: '0.75rem',
  background: 'rgba(0,0,0,0.4)',
  color: 'white',
  outline: 'none',
  border: '2px solid var(--border-color)',
  width: '100%',
  fontFamily: 'var(--font-main)',
  fontSize: '1.2rem',
};

export default Profile;
