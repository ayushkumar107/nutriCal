import { useContext, useState, useEffect, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, Link } from 'react-router-dom';
import axios from 'axios';
import { scoreFood } from '../utils/foodScore';
import { Flame, Beef, Wheat, Droplet, Camera, Target, Utensils, Bot, Package, XCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';

const Dashboard = () => {
  const { user, loading } = useContext(AuthContext);
  const [dailyData, setDailyData] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);

  const fetchDailyData = useCallback(async () => {
    try {
      const res = await axios.get('/meals/today');
      setDailyData(res.data);
    } catch (err) {
      console.error('Failed to fetch daily data:', err);
    } finally {
      setDataLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchDailyData();
    }
  }, [user, fetchDailyData]);

  const handleDeleteMeal = async (mealId) => {
    try {
      await axios.delete(`/meals/${mealId}`);
      fetchDailyData(); // Refresh
    } catch (err) {
      console.error('Failed to delete meal:', err);
    }
  };

  if (loading) return <div className="main-content" style={{ textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  const totals = dailyData?.totals || { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const targets = dailyData?.targets || { calorieTarget: 2500, proteinTarget: 150, carbsTarget: 300, fatsTarget: 80 };
  const meals = dailyData?.meals || [];

  const getProgress = (current, target) => Math.min((current / target) * 100, 100);
  const getProgressColor = (percent) => {
    if (percent < 50) return 'linear-gradient(90deg, #0ea5e9, #38bdf8)';
    if (percent < 80) return 'linear-gradient(90deg, #0ea5e9, #22c55e)';
    if (percent <= 100) return 'linear-gradient(90deg, #22c55e, #a3e635)';
    return 'linear-gradient(90deg, #f59e0b, #ef4444)';
  };

  const getDailyVerdict = () => {
    const calPercent = getProgress(totals.calories, targets.calorieTarget);
    if (user.goal === 'Cutting') {
      if (calPercent > 100) return { icon: <XCircle size={32} />, text: 'Over your calorie limit! Consider lighter meals for the rest of the day.', color: 'var(--accent-danger)' };
      if (calPercent > 80) return { icon: <AlertTriangle size={32} />, text: 'Approaching your daily limit. Be mindful with remaining meals.', color: 'var(--accent-warning)' };
      return { icon: <CheckCircle size={32} />, text: 'Great progress! You\'re well within your calorie budget today.', color: 'var(--accent-success)' };
    }
    if (user.goal === 'Bulking') {
      if (calPercent < 40) return { icon: <Info size={32} />, text: 'You need more fuel! Add a high-calorie meal to hit your surplus.', color: 'var(--accent-warning)' };
      if (calPercent >= 90) return { icon: <Beef size={32} />, text: 'Excellent! You\'re smashing your bulking target today.', color: 'var(--accent-success)' };
      return { icon: <Target size={32} />, text: 'On track! Keep eating to meet your caloric surplus goal.', color: 'var(--text-accent)' };
    }
    if (calPercent > 100) return { icon: <AlertTriangle size={32} />, text: 'Slightly over your maintenance calories. No worries—balance it tomorrow!', color: 'var(--accent-warning)' };
    return { icon: <Target size={32} />, text: 'You\'re maintaining well. Stay consistent!', color: 'var(--accent-success)' };
  };

  const verdict = getDailyVerdict();
  const now = new Date();
  const dateString = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const macros = [
    { label: 'Calories', current: Math.round(totals.calories), target: targets.calorieTarget, unit: 'kcal', icon: <Flame size={16} /> },
    { label: 'Protein', current: Math.round(totals.protein), target: targets.proteinTarget, unit: 'g', icon: <Beef size={16} /> },
    { label: 'Carbs', current: Math.round(totals.carbs), target: targets.carbsTarget, unit: 'g', icon: <Wheat size={16} /> },
    { label: 'Fats', current: Math.round(totals.fats), target: targets.fatsTarget, unit: 'g', icon: <Droplet size={16} /> },
  ];

  return (
    <div className="main-content">
      {/* Header Section */}
      <div className="animate-fade-in" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem' }}>
            Welcome back, <span style={{ color: 'var(--text-accent)' }}>{user.name}</span> 👋
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>{dateString}</p>
        </div>

        {dailyData?.streak > 0 && (
          <div className="glass" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            color: '#f59e0b',
            fontWeight: 800,
            fontSize: '1rem',
            border: '2px solid #f59e0b',
            background: 'rgba(245, 158, 11, 0.15)',
            boxShadow: '4px 4px 0px rgba(245, 158, 11, 0.3)',
          }}>
            <Flame size={20} color="#f59e0b" style={{ animation: 'pulse-glow 2s infinite' }} />
            {dailyData.streak} Day Streak!
          </div>
        )}
      </div>

      {dataLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div className="loading-spinner" />
          <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading your daily stats...</p>
        </div>
      ) : (
        <>
          {/* Daily Goal Banner */}
          <div className="glass animate-fade-in daily-goal-banner" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ display: 'flex', color: verdict.color }}>{verdict.icon}</span>
            <div style={{ flex: 1 }}>
              <strong style={{ color: verdict.color }}>{user.goal} Mode</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem', marginBottom: 0 }}>{verdict.text}</p>
            </div>
          </div>

          {/* Macro Progress Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {macros.map((macro, i) => {
              const percent = getProgress(macro.current, macro.target);
              return (
                <div
                  key={macro.label}
                  className="glass animate-fade-in macro-card"
                  style={{ padding: '1.25rem', animationDelay: `${i * 0.08}s` }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      {macro.icon} {macro.label}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                      {Math.round(percent)}%
                    </span>
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.35)', borderRadius: '1rem', height: '10px', overflow: 'hidden', marginBottom: '0.5rem' }}>
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${percent}%`,
                        background: getProgressColor(percent),
                        height: '100%',
                        borderRadius: '1rem',
                        transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {macro.current} {macro.unit}
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                      / {macro.target} {macro.unit}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            <Link
              to="/scanner"
              className="glass animate-fade-in scan-card"
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                textDecoration: 'none',
                color: 'var(--text-primary)',
                animationDelay: '0.3s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
              }}
            >
              <Camera size={40} style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Scan Food</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                Upload an image or scan a barcode
              </p>
            </Link>

            <div
              className="glass animate-fade-in"
              style={{
                padding: '1.5rem',
                textAlign: 'center',
                animationDelay: '0.35s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Target size={40} style={{ marginBottom: '0.5rem', color: 'var(--text-primary)' }} />
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Daily Target</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', margin: 0 }}>
                {targets.calorieTarget} kcal • {targets.proteinTarget}g P • {targets.carbsTarget}g C • {targets.fatsTarget}g F
              </p>
            </div>
          </div>

          {/* Meal History */}
          <div className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Utensils size={20} /> Today's Meals
              <span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
                ({meals.length} logged)
              </span>
            </h3>

            {meals.length === 0 ? (
              <div className="glass" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <span style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', opacity: 0.5 }}><Utensils size={48} /></span>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>No meals logged yet today</p>
                <Link to="/scanner" className="btn" style={{ display: 'inline-block' }}>
                  Log Your First Meal
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {meals.map((meal, index) => (
                  <div
                    key={meal._id || index}
                    className="glass meal-item animate-fade-in"
                    style={{
                      padding: '1rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      animationDelay: `${0.4 + index * 0.05}s`,
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', position: 'relative', display: 'flex' }}>
                      {(() => {
                        const s = scoreFood(meal.calories, meal.protein, user.goal);
                        return (
                          <>
                            <span style={{ display: 'flex' }}>{meal.aiEstimate ? <Bot size={24} color="var(--text-primary)" /> : <Package size={24} color="var(--text-primary)" />}</span>
                            <span style={{
                              position: 'absolute',
                              bottom: '-2px',
                              right: '-4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              background: 'var(--bg-card)',
                              borderRadius: '50%',
                              padding: '2px',
                              filter: `drop-shadow(0 0 4px ${s.color})`,
                            }}>
                              {s.grade === 'GOOD' ? <CheckCircle size={14} color={s.color} /> : 
                               s.grade === 'MODERATE' ? <AlertTriangle size={14} color={s.color} /> : 
                               <XCircle size={14} color={s.color} />}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{meal.productName}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.25rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Flame size={12} /> {meal.calories} kcal</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Beef size={12} /> {meal.protein}g</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Wheat size={12} /> {meal.carbs}g</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}><Droplet size={12} /> {meal.fats}g</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                        {new Date(meal.loggedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <button
                        onClick={() => handleDeleteMeal(meal._id)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '1rem',
                          padding: '0.25rem',
                          borderRadius: '50%',
                          transition: 'background 0.2s',
                          color: 'var(--accent-danger)',
                          opacity: 0.6,
                        }}
                        onMouseEnter={(e) => e.target.style.opacity = 1}
                        onMouseLeave={(e) => e.target.style.opacity = 0.6}
                        title="Remove meal"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
