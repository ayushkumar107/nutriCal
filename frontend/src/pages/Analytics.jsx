import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import axios from 'axios';
import { 
  BarChart3, 
  Flame, 
  Beef, 
  Wheat, 
  Droplets, 
  AlertTriangle, 
  Dumbbell, 
  Megaphone, 
  Ban, 
  Target, 
  ClipboardCheck 
} from 'lucide-react';

const Analytics = () => {
  const { user, loading } = useContext(AuthContext);
  const [data, setData] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [period, setPeriod] = useState('week'); // 'day', 'week', 'month'

  useEffect(() => {
    if (user) {
      setFetching(true);
      axios.get(`/analytics/analytics?period=${period}`)
        .then((res) => setData(res.data))
        .catch(console.error)
        .finally(() => setFetching(false));
    }
  }, [user, period]);

  if (loading) return <div className="main-content" style={{ textAlign: 'center' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" />;

  if (fetching) {
    return (
      <div className="main-content" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <div className="loading-spinner" />
        <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>Loading analytics...</p>
      </div>
    );
  }

  if (!data) return <div className="main-content" style={{ textAlign: 'center' }}>Failed to load analytics</div>;

  const { dailyData, targets, weekAvg, performanceScore, calScore, proteinScore, insights, daysWithData, goal } = data;
  const maxCalorie = Math.max(targets.calorieTarget, ...dailyData.map(d => d.calories)) * 1.1;
  const maxProtein = Math.max(targets.proteinTarget, ...dailyData.map(d => d.protein)) * 1.1;

  // Score ring color
  const getScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const scoreColor = getScoreColor(performanceScore);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (performanceScore / 100) * circumference;

  const timeRangeLabel = period === 'day' ? 'Today' : period === 'month' ? 'Last 30 days' : 'Last 7 days';
  const headerTitle = period === 'day' ? 'Daily Analytics' : period === 'month' ? 'Monthly Analytics' : 'Weekly Analytics';

  const getInsightIcon = (iconName) => {
    switch (iconName) {
      case 'warning': return <AlertTriangle size={20} color="#f59e0b" />;
      case 'muscle': return <Dumbbell size={20} color="#22c55e" />;
      case 'megaphone': return <Megaphone size={20} color="#f59e0b" />;
      case 'ban': return <Ban size={20} color="#ef4444" />;
      case 'flame': return <Flame size={20} color="#ef4444" />;
      case 'target': return <Target size={20} color="#22c55e" />;
      case 'clipboard': return <ClipboardCheck size={20} color="var(--accent-primary)" />;
      case 'bar-chart': return <BarChart3 size={20} color="var(--accent-primary)" />;
      default: return <Target size={20} />;
    }
  };

  const getMacroIcon = (iconName, size = 16, color = "currentColor") => {
    switch (iconName) {
      case 'calories': return <Flame size={size} color={color} />;
      case 'protein': return <Beef size={size} color={color} />;
      case 'carbs': return <Wheat size={size} color={color} />;
      case 'fats': return <Droplets size={size} color={color} />;
      default: return null;
    }
  };

  return (
    <div className="main-content">
      <div className="animate-fade-in" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart3 size={24} color="var(--neon-cyan)" /> {headerTitle}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
            {timeRangeLabel} • {daysWithData} day{daysWithData !== 1 ? 's' : ''} logged • {goal} mode
          </p>
        </div>
        
        {/* Period Toggle */}
        <div style={{ display: 'flex', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
          {['day', 'week', 'month'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                background: period === p ? 'var(--accent-primary)' : 'transparent',
                color: period === p ? 'white' : 'var(--text-secondary)',
                border: 'none',
                padding: '6px 12px',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 600,
                textTransform: 'capitalize',
                transition: 'all 0.2s ease',
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Top Row: Score + Insights */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Performance Score Ring */}
        <div className="glass animate-fade-in" style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: '180px',
        }}>
          <svg width="130" height="130" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="54" fill="none"
              stroke={scoreColor}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
                transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)',
                filter: `drop-shadow(0 0 6px ${scoreColor})`
              }}
            />
            <text x="60" y="52" textAnchor="middle" fill={scoreColor} fontSize="28" fontWeight="800">{performanceScore}</text>
            <text x="60" y="72" textAnchor="middle" fill="var(--text-secondary)" fontSize="10" fontWeight="500">{period.toUpperCase()} SCORE</text>
          </svg>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Flame size={12} /> Cal: {calScore}%</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Beef size={12} /> Pro: {proteinScore}%</span>
          </div>
        </div>

        {/* Insights */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {insights.map((insight, i) => (
            <div
              key={i}
              className="glass animate-fade-in"
              style={{
                padding: '1rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.85rem',
                borderLeft: `3px solid ${insight.type === 'success' ? '#22c55e' : insight.type === 'warning' ? '#f59e0b' : 'var(--accent-primary)'}`,
                animationDelay: `${i * 0.1}s`,
              }}
            >
              <span style={{ flexShrink: 0 }}>{getInsightIcon(insight.icon)}</span>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0, lineHeight: 1.5 }}>{insight.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Calorie Trend Chart */}
      <div className="glass animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.25rem', animationDelay: '0.2s' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flame size={18} color="var(--text-accent)" /> Calorie Trend
          <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
            Target: {targets.calorieTarget} kcal/day
          </span>
        </h3>
        <div style={{ position: 'relative', height: '180px' }}>
          {/* Target line */}
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            bottom: `${(targets.calorieTarget / maxCalorie) * 100}%`,
            borderBottom: '2px dashed rgba(14, 165, 233, 0.4)',
            zIndex: 1,
          }}>
            <span style={{
              position: 'absolute',
              right: 0, top: '-18px',
              fontSize: '0.65rem',
              color: 'var(--text-accent)',
              background: 'var(--bg-primary)',
              padding: '0 4px',
            }}>target</span>
          </div>
          {/* Bars */}
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: '0.5rem', position: 'relative', zIndex: 2 }}>
            {dailyData.map((day, i) => {
              const height = maxCalorie > 0 ? (day.calories / maxCalorie) * 100 : 0;
              const isToday = i === dailyData.length - 1;
              const overTarget = day.calories > targets.calorieTarget;
              const barColor = day.calories === 0
                ? 'rgba(255,255,255,0.05)'
                : overTarget
                  ? 'linear-gradient(to top, #ef4444, #f97316)'
                  : isToday
                    ? 'linear-gradient(to top, #0ea5e9, #38bdf8)'
                    : 'linear-gradient(to top, rgba(14,165,233,0.5), rgba(56,189,248,0.5))';

              return (
                <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  {day.calories > 0 && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                      {day.calories}
                    </span>
                  )}
                  <div
                    className="chart-bar"
                    style={{
                      width: '100%',
                      maxWidth: period === 'month' ? '12px' : '50px',
                      height: `${Math.max(height, 2)}%`,
                      background: barColor,
                      borderRadius: '6px 6px 2px 2px',
                      transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
                      position: 'relative',
                      border: isToday && period !== 'month' ? '1px solid rgba(56,189,248,0.5)' : 'none',
                    }}
                  />
                  <span style={{
                    fontSize: '0.7rem',
                    color: isToday ? 'var(--text-accent)' : 'var(--text-secondary)',
                    marginTop: '6px',
                    fontWeight: isToday ? 700 : 400,
                  }}>{day.dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Protein Trend Chart */}
      <div className="glass animate-fade-in" style={{ padding: '1.5rem', marginBottom: '1.25rem', animationDelay: '0.3s' }}>
        <h3 style={{ fontSize: '0.95rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Beef size={18} color="#22c55e" /> Protein vs Target
          <span style={{ fontSize: '0.7rem', fontWeight: 400, color: 'var(--text-secondary)' }}>
            Target: {targets.proteinTarget}g/day
          </span>
        </h3>
        <div style={{ position: 'relative', height: '160px' }}>
          <div style={{
            position: 'absolute',
            left: 0, right: 0,
            bottom: `${(targets.proteinTarget / maxProtein) * 100}%`,
            borderBottom: '2px dashed rgba(34, 197, 94, 0.4)',
            zIndex: 1,
          }}>
            <span style={{
              position: 'absolute',
              right: 0, top: '-18px',
              fontSize: '0.65rem',
              color: '#22c55e',
              background: 'var(--bg-primary)',
              padding: '0 4px',
            }}>target</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: '100%', gap: '0.5rem', position: 'relative', zIndex: 2 }}>
            {dailyData.map((day, i) => {
              const height = maxProtein > 0 ? (day.protein / maxProtein) * 100 : 0;
              const isToday = i === dailyData.length - 1;
              const hitTarget = day.protein >= targets.proteinTarget;

              return (
                <div key={day.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  {day.protein > 0 && (
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 600 }}>
                      {day.protein}g
                    </span>
                  )}
                  <div style={{
                    width: '100%',
                    maxWidth: period === 'month' ? '12px' : '50px',
                    height: `${Math.max(height, 2)}%`,
                    background: day.protein === 0
                      ? 'rgba(255,255,255,0.05)'
                      : hitTarget
                        ? 'linear-gradient(to top, #22c55e, #4ade80)'
                        : isToday
                          ? 'linear-gradient(to top, #f59e0b, #fbbf24)'
                          : 'linear-gradient(to top, rgba(245,158,11,0.5), rgba(251,191,36,0.5))',
                    borderRadius: '6px 6px 2px 2px',
                    transition: 'height 1s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: isToday && period !== 'month' ? '1px solid rgba(251,191,36,0.4)' : 'none',
                  }} />
                  <span style={{
                    fontSize: '0.7rem',
                    color: isToday ? 'var(--text-accent)' : 'var(--text-secondary)',
                    marginTop: '6px',
                    fontWeight: isToday ? 700 : 400,
                  }}>{day.dayLabel}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '0.75rem', animationDelay: '0.4s' }}>
        {[
          { label: period === 'day' ? 'Total Calories' : 'Avg Calories', value: weekAvg.calories, target: targets.calorieTarget, unit: 'kcal', type: 'calories', color: 'var(--text-accent)' },
          { label: period === 'day' ? 'Total Protein' : 'Avg Protein', value: weekAvg.protein, target: targets.proteinTarget, unit: 'g', type: 'protein', color: '#22c55e' },
          { label: period === 'day' ? 'Total Carbs' : 'Avg Carbs', value: weekAvg.carbs, target: targets.carbsTarget, unit: 'g', type: 'carbs', color: '#f59e0b' },
          { label: period === 'day' ? 'Total Fats' : 'Avg Fats', value: weekAvg.fats, target: targets.fatsTarget, unit: 'g', type: 'fats', color: '#a78bfa' },
        ].map((card, i) => {
          const pct = Math.round((card.value / card.target) * 100);
          return (
            <div key={card.label} className="glass animate-fade-in macro-card" style={{ padding: '1rem', textAlign: 'center', animationDelay: `${0.4 + i * 0.08}s` }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                {getMacroIcon(card.type, 12, card.color)} {card.label}
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: card.color, margin: '0.4rem 0 0.2rem' }}>{card.value}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>/ {card.target} {card.unit}</div>
              <div style={{
                marginTop: '0.5rem',
                fontSize: '0.7rem',
                fontWeight: 700,
                color: pct >= 90 ? '#22c55e' : pct >= 60 ? '#f59e0b' : '#ef4444',
              }}>{pct}%</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Analytics;
