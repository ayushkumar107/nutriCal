/**
 * Real-Time Food Scoring System
 * Scores every food as: Good | Moderate | Avoid
 * Based on: Calories, Protein, and User Goal
 */

export const scoreFood = (calories, protein, goal) => {
  const cal = Number(calories) || 0;
  const prot = Number(protein) || 0;
  const proteinRatio = cal > 0 ? (prot * 4) / cal : 0; // protein cal / total cal

  if (goal === 'Bulking') {
    // Bulking: high cal + high protein = Good, low cal = Moderate, low protein + low cal = Avoid
    if (cal >= 400 && proteinRatio >= 0.15) {
      return {
        grade: 'GOOD',
        label: 'Good',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.15)',
        border: '#22c55e',
        reason: 'High calorie with solid protein — perfect for your bulk.',
      };
    }
    if (cal >= 250 || proteinRatio >= 0.2) {
      return {
        grade: 'MODERATE',
        label: 'Moderate',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.15)',
        border: '#f59e0b',
        reason: 'Decent but you may need more calories to hit your surplus.',
      };
    }
    return {
      grade: 'AVOID',
      label: 'Avoid',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: '#ef4444',
      reason: 'Too low in calories and protein for effective bulking.',
    };
  }

  if (goal === 'Cutting') {
    // Cutting: low cal + high protein = Good, moderate cal = Moderate, high cal + low protein = Avoid
    if (cal <= 350 && proteinRatio >= 0.2) {
      return {
        grade: 'GOOD',
        label: 'Good',
        color: '#22c55e',
        bg: 'rgba(34, 197, 94, 0.15)',
        border: '#22c55e',
        reason: 'Low calorie, high protein — ideal for preserving muscle on a cut.',
      };
    }
    if (cal <= 500) {
      return {
        grade: 'MODERATE',
        label: 'Moderate',
        color: '#f59e0b',
        bg: 'rgba(245, 158, 11, 0.15)',
        border: '#f59e0b',
        reason: 'Moderate calories — fits your cut if you balance the rest of the day.',
      };
    }
    return {
      grade: 'AVOID',
      label: 'Avoid',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.12)',
      border: '#ef4444',
      reason: 'Too calorie-dense for a cutting diet. Consider a lighter option.',
    };
  }

  // Maintenance
  if (cal <= 500 && proteinRatio >= 0.15) {
    return {
      grade: 'GOOD',
      label: 'Good',
      color: '#22c55e',
      bg: 'rgba(34, 197, 94, 0.15)',
      border: '#22c55e',
      reason: 'Well-balanced meal that fits your maintenance calories perfectly.',
    };
  }
  if (cal <= 700) {
    return {
      grade: 'MODERATE',
      label: 'Moderate',
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: '#f59e0b',
      reason: 'Slightly heavy — be mindful of your remaining meals today.',
    };
  }
  return {
    grade: 'AVOID',
    label: 'Avoid',
    color: '#ef4444',
    bg: 'rgba(239, 68, 68, 0.12)',
    border: '#ef4444',
    reason: 'Very calorie-dense for maintenance. Try splitting into two meals.',
  };
};
