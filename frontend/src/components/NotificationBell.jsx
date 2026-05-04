import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, BellOff, Utensils, Beef, Droplets, Sunrise, Megaphone, Ban, Dumbbell, Target, GlassWater, X } from 'lucide-react';

const generateNotifications = (dailyData, user) => {
  const notifications = [];
  const now = new Date();
  const hour = now.getHours();

  if (!dailyData || !user) return notifications;

  const { totals, targets, meals } = dailyData;
  const mealCount = meals?.length || 0;
  const calPercent = targets?.calorieTarget ? Math.round((totals.calories / targets.calorieTarget) * 100) : 0;
  const protPercent = targets?.proteinTarget ? Math.round((totals.protein / targets.proteinTarget) * 100) : 0;

  // No meals logged
  if (mealCount === 0) {
    notifications.push({
      id: 'no-meals',
      icon: <Utensils size={20} color="#f59e0b" />,
      title: "You haven't logged food today",
      body: 'Start scanning your meals to track your progress!',
      type: 'warning',
      time: 'Today',
    });
  }

  // Protein low
  if (mealCount > 0 && protPercent < 30 && hour >= 14) {
    notifications.push({
      id: 'low-protein',
      icon: <Beef size={20} color="#ef4444" />,
      title: 'Protein intake is low today',
      body: `Only ${Math.round(totals.protein)}g of ${targets.proteinTarget}g (${protPercent}%). Add lean meats or a shake!`,
      type: 'warning',
      time: 'Just now',
    });
  }

  // Water reminder (every few hours)
  if (hour >= 10 && hour <= 20 && hour % 3 === 0) {
    notifications.push({
      id: 'water',
      icon: <Droplets size={20} color="#38bdf8" />,
      title: 'Time to hydrate!',
      body: 'Drink a glass of water. Staying hydrated helps with performance and recovery.',
      type: 'info',
      time: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`,
    });
  }

  // Morning motivation
  if (hour >= 6 && hour < 11 && mealCount === 0) {
    notifications.push({
      id: 'morning',
      icon: <Sunrise size={20} color="#fbbf24" />,
      title: 'Good morning! Start your day right',
      body: user.goal === 'Bulking'
        ? 'A high-protein breakfast will kickstart your muscle-building day!'
        : user.goal === 'Cutting'
          ? 'A light, protein-rich breakfast will keep you satisfied without breaking your budget.'
          : 'Fuel up with a balanced breakfast to maintain your energy.',
      type: 'info',
      time: 'Morning',
    });
  }

  // Afternoon check-in
  if (hour >= 13 && hour <= 15 && mealCount > 0 && calPercent < 40) {
    notifications.push({
      id: 'afternoon',
      icon: <Megaphone size={20} color="#f59e0b" />,
      title: user.goal === 'Bulking' ? 'You need more calories!' : 'Lunchtime check-in',
      body: user.goal === 'Bulking'
        ? `Only ${calPercent}% of your calorie target done. Time for a big lunch!`
        : `You're at ${calPercent}% of daily calories. Plenty of room for a good lunch.`,
      type: user.goal === 'Bulking' ? 'warning' : 'success',
      time: 'Afternoon',
    });
  }

  // Evening wrap-up
  if (hour >= 19 && mealCount > 0) {
    if (user.goal === 'Cutting' && calPercent > 90) {
      notifications.push({
        id: 'evening-cut',
        icon: <Ban size={20} color="#ef4444" />,
        title: 'Almost at your calorie limit',
        body: `You've used ${calPercent}% of your daily calories. Keep dinner light!`,
        type: 'warning',
        time: 'Evening',
      });
    }
    if (user.goal === 'Bulking' && calPercent < 60) {
      notifications.push({
        id: 'evening-bulk',
        icon: <Dumbbell size={20} color="#22c55e" />,
        title: "Don't forget your calories!",
        body: `Only ${calPercent}% of your target. Consider a calorie-dense dinner or a shake before bed.`,
        type: 'warning',
        time: 'Evening',
      });
    }
  }

  // Goal milestone
  if (mealCount > 0 && calPercent >= 80 && calPercent <= 105 && protPercent >= 70) {
    notifications.push({
      id: 'on-track',
      icon: <Target size={20} color="#22c55e" />,
      title: "You're crushing it today!",
      body: `${calPercent}% calories, ${protPercent}% protein. Keep it up!`,
      type: 'success',
      time: 'Now',
    });
  }

  // Water general (always show as a soft reminder)
  if (hour >= 8 && hour <= 22 && hour % 3 !== 0) {
    notifications.push({
      id: 'water-soft',
      icon: <GlassWater size={20} color="#38bdf8" />,
      title: 'Stay hydrated',
      body: 'Aim for 2-3 liters of water today for optimal performance.',
      type: 'info',
      time: 'Reminder',
    });
  }

  return notifications;
};

const NotificationBell = ({ user }) => {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [dismissed, setDismissed] = useState([]);
  const [dailyData, setDailyData] = useState(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (user) {
      axios.get('/meals/today')
        .then((res) => setDailyData(res.data))
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (dailyData && user) {
      const notifs = generateNotifications(dailyData, user);
      setNotifications(notifs);
    }
  }, [dailyData, user]);

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const activeNotifs = notifications.filter((n) => !dismissed.includes(n.id));
  const count = activeNotifs.length;

  const dismissNotif = (id) => {
    setDismissed((prev) => [...prev, id]);
  };

  const getTypeBorder = (type) => {
    switch (type) {
      case 'warning': return '#f59e0b';
      case 'success': return '#22c55e';
      default: return 'var(--accent-primary)';
    }
  };

  return (
    <div ref={panelRef} style={{ position: 'relative' }}>
      {/* Bell Button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          position: 'relative',
          padding: '0.35rem',
          color: 'var(--text-primary)',
          transition: 'transform 0.2s',
          display: 'flex',
          alignItems: 'center',
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.15)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        title="Notifications"
      >
        <Bell size={22} color="var(--neon-cyan)" />
        {count > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '-2px',
            width: '18px',
            height: '18px',
            background: 'var(--accent-danger)',
            color: 'white',
            fontSize: '0.6rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #000',
            boxShadow: '2px 2px 0px #000',
          }}>
            {count}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {open && (
        <div
          className="animate-fade-in"
          style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '0.75rem',
            width: '340px',
            maxHeight: '420px',
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: '2px solid var(--border-color)',
            boxShadow: '6px 6px 0px rgba(0,0,0,0.8)',
            zIndex: 1000,
          }}
        >
          {/* Panel Header */}
          <div style={{
            padding: '1rem 1.25rem 0.75rem',
            borderBottom: '2px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <span style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bell size={16} color="var(--neon-cyan)" /> Notifications
            </span>
            {activeNotifs.length > 0 && (
              <button
                onClick={() => setDismissed(notifications.map((n) => n.id))}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-accent)',
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontFamily: 'var(--font-heading)',
                }}
              >
                Clear all
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div style={{ padding: '0.5rem' }}>
            {activeNotifs.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
                <BellOff size={32} color="var(--text-secondary)" style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>All caught up!</p>
              </div>
            ) : (
              activeNotifs.map((notif, i) => (
                <div
                  key={notif.id}
                  className="animate-fade-in"
                  style={{
                    padding: '0.85rem 1rem',
                    marginBottom: '0.35rem',
                    display: 'flex',
                    gap: '0.75rem',
                    alignItems: 'flex-start',
                    background: 'rgba(255,255,255,0.03)',
                    borderLeft: `3px solid ${getTypeBorder(notif.type)}`,
                    transition: 'background 0.2s',
                    animationDelay: `${i * 0.05}s`,
                    cursor: 'default',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                >
                  <span style={{ flexShrink: 0, marginTop: '0.1rem', display: 'flex' }}>{notif.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.2rem' }}>{notif.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>{notif.body}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.35rem', opacity: 0.7 }}>{notif.time}</div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismissNotif(notif.id); }}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-secondary)',
                      cursor: 'pointer',
                      padding: '0.15rem',
                      opacity: 0.5,
                      transition: 'opacity 0.2s',
                      flexShrink: 0,
                      display: 'flex',
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                    onMouseLeave={(e) => e.currentTarget.style.opacity = 0.5}
                    title="Dismiss"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
