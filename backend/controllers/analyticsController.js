const MealLog = require('../models/MealLog');

// Helper: calculate daily calorie target based on user profile
const calculateDailyTarget = (user) => {
  let bmr = 10 * (user.weight || 70) + 6.25 * (user.height || 170) - 5 * (user.age || 25) + 5;
  let tdee = Math.round(bmr * 1.55);
  let calorieTarget, proteinTarget, carbsTarget, fatsTarget;

  switch (user.goal) {
    case 'Bulking':
      calorieTarget = tdee + 500;
      proteinTarget = Math.round((user.weight || 70) * 2.2);
      fatsTarget = Math.round((calorieTarget * 0.25) / 9);
      carbsTarget = Math.round((calorieTarget - proteinTarget * 4 - fatsTarget * 9) / 4);
      break;
    case 'Cutting':
      calorieTarget = tdee - 500;
      proteinTarget = Math.round((user.weight || 70) * 2.4);
      fatsTarget = Math.round((calorieTarget * 0.25) / 9);
      carbsTarget = Math.round((calorieTarget - proteinTarget * 4 - fatsTarget * 9) / 4);
      break;
    default:
      calorieTarget = tdee;
      proteinTarget = Math.round((user.weight || 70) * 1.8);
      fatsTarget = Math.round((calorieTarget * 0.3) / 9);
      carbsTarget = Math.round((calorieTarget - proteinTarget * 4 - fatsTarget * 9) / 4);
  }

  return { calorieTarget, proteinTarget, carbsTarget, fatsTarget };
};

// @desc    Get analytics data (day, week, month)
// @route   GET /api/meals/analytics
// @access  Private
const getWeeklyAnalytics = async (req, res) => {
  try {
    const user = req.user;
    const targets = calculateDailyTarget(user);
    const period = req.query.period || 'week';

    let numDays = 7;
    if (period === 'day') numDays = 1;
    if (period === 'month') numDays = 30;

    // Get dates
    const days = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    // Fetch all meal logs for the last 7 days
    const logs = await MealLog.find({
      user: user._id,
      date: { $in: days },
    });

    // Build daily data
    const dailyData = days.map((date) => {
      const log = logs.find((l) => l.date === date);
      const meals = log ? log.meals : [];
      const totals = meals.reduce(
        (acc, m) => ({
          calories: acc.calories + m.calories,
          protein: acc.protein + m.protein,
          carbs: acc.carbs + m.carbs,
          fats: acc.fats + m.fats,
        }),
        { calories: 0, protein: 0, carbs: 0, fats: 0 }
      );

      return {
        date,
        dayLabel: period === 'month' ? date.slice(8, 10) : new Date(date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short' }),
        mealCount: meals.length,
        calories: Math.round(totals.calories),
        protein: Math.round(totals.protein),
        carbs: Math.round(totals.carbs),
        fats: Math.round(totals.fats),
      };
    });

    // Calculate weekly totals and averages
    const weekTotals = dailyData.reduce(
      (acc, d) => ({
        calories: acc.calories + d.calories,
        protein: acc.protein + d.protein,
        carbs: acc.carbs + d.carbs,
        fats: acc.fats + d.fats,
        meals: acc.meals + d.mealCount,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, meals: 0 }
    );

    const daysWithData = dailyData.filter((d) => d.mealCount > 0).length || 1;
    const weekAvg = {
      calories: Math.round(weekTotals.calories / daysWithData),
      protein: Math.round(weekTotals.protein / daysWithData),
      carbs: Math.round(weekTotals.carbs / daysWithData),
      fats: Math.round(weekTotals.fats / daysWithData),
    };

    // Performance score (0-100)
    const calScore = Math.min(100, Math.round((weekAvg.calories / targets.calorieTarget) * 100));
    const proteinScore = Math.min(100, Math.round((weekAvg.protein / targets.proteinTarget) * 100));
    const overallScore = Math.round((calScore + proteinScore) / 2);

    // Generate insights
    const insights = [];
    const proteinDiff = Math.round(((weekAvg.protein - targets.proteinTarget) / targets.proteinTarget) * 100);
    const calDiff = Math.round(((weekAvg.calories - targets.calorieTarget) / targets.calorieTarget) * 100);

    if (proteinDiff < -10) {
      insights.push({
        type: 'warning',
        icon: 'warning',
        text: `You are ${Math.abs(proteinDiff)}% below your protein target this week. Add more lean meats, eggs, or protein shakes.`,
      });
    } else if (proteinDiff >= 0) {
      insights.push({
        type: 'success',
        icon: 'muscle',
        text: `Great protein intake! You're hitting ${100 + proteinDiff}% of your daily protein target.`,
      });
    }

    if (user.goal === 'Bulking' && calDiff < -15) {
      insights.push({
        type: 'warning',
        icon: 'megaphone',
        text: `You're ${Math.abs(calDiff)}% under your calorie target. You need more food to build muscle effectively.`,
      });
    } else if (user.goal === 'Cutting' && calDiff > 10) {
      insights.push({
        type: 'warning',
        icon: 'ban',
        text: `You're ${calDiff}% over your calorie limit. Tighten up your portions to stay in a deficit.`,
      });
    } else if (user.goal === 'Cutting' && calDiff <= 0) {
      insights.push({
        type: 'success',
        icon: 'flame',
        text: `Perfect calorie control! You're maintaining a solid deficit for your cut.`,
      });
    } else if (user.goal === 'Bulking' && calDiff >= -5) {
      insights.push({
        type: 'success',
        icon: 'target',
        text: `On track! You're consistently hitting your calorie surplus for bulking.`,
      });
    }

    if (weekTotals.meals === 0) {
      insights.push({
        type: 'info',
        icon: 'clipboard',
        text: `No meals logged this ${period} yet. Start scanning your food to see analytics!`,
      });
    } else if (daysWithData < (period === 'month' ? 10 : period === 'week' ? 4 : 1)) {
      insights.push({
        type: 'info',
        icon: 'bar-chart',
        text: `Only ${daysWithData} day${daysWithData > 1 ? 's' : ''} of data so far. Log consistently for better insights.`,
      });
    }

    res.json({
      dailyData,
      targets,
      weekTotals,
      weekAvg,
      performanceScore: overallScore,
      calScore,
      proteinScore,
      insights,
      daysWithData,
      goal: user.goal,
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Failed to fetch analytics data' });
  }
};

module.exports = { getWeeklyAnalytics };
