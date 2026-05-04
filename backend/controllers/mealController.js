const MealLog = require('../models/MealLog');

// Helper: get today's date string in YYYY-MM-DD
const getTodayString = () => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

// Helper: calculate daily calorie target based on user profile
const calculateDailyTarget = (user) => {
  // Mifflin-St Jeor Equation (default male, adjust if needed)
  let bmr = 10 * (user.weight || 70) + 6.25 * (user.height || 170) - 5 * (user.age || 25) + 5;

  let multiplier = 1.55; // moderate activity
  let tdee = Math.round(bmr * multiplier);

  let calorieTarget, proteinTarget, carbsTarget, fatsTarget;

  switch (user.goal) {
    case 'Bulking':
      calorieTarget = tdee + 500;
      proteinTarget = Math.round((user.weight || 70) * 2.2); // 2.2g/kg
      fatsTarget = Math.round((calorieTarget * 0.25) / 9);
      carbsTarget = Math.round((calorieTarget - proteinTarget * 4 - fatsTarget * 9) / 4);
      break;
    case 'Cutting':
      calorieTarget = tdee - 500;
      proteinTarget = Math.round((user.weight || 70) * 2.4); // higher protein when cutting
      fatsTarget = Math.round((calorieTarget * 0.25) / 9);
      carbsTarget = Math.round((calorieTarget - proteinTarget * 4 - fatsTarget * 9) / 4);
      break;
    default: // Maintenance
      calorieTarget = tdee;
      proteinTarget = Math.round((user.weight || 70) * 1.8);
      fatsTarget = Math.round((calorieTarget * 0.3) / 9);
      carbsTarget = Math.round((calorieTarget - proteinTarget * 4 - fatsTarget * 9) / 4);
  }

  return { calorieTarget, proteinTarget, carbsTarget, fatsTarget };
};

// @desc    Log a meal to today's log
// @route   POST /api/meals/log
// @access  Private
const logMeal = async (req, res) => {
  const { productName, calories, protein, carbs, fats, aiEstimate } = req.body;

  if (!productName) {
    return res.status(400).json({ message: 'Product name is required' });
  }

  const today = getTodayString();

  try {
    let mealLog = await MealLog.findOne({ user: req.user._id, date: today });

    const meal = {
      productName,
      calories: Number(calories) || 0,
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
      aiEstimate: aiEstimate || false,
      loggedAt: new Date(),
    };

    if (mealLog) {
      mealLog.meals.push(meal);
      await mealLog.save();
    } else {
      mealLog = await MealLog.create({
        user: req.user._id,
        date: today,
        meals: [meal],
      });
    }

    res.status(201).json(mealLog);
  } catch (error) {
    console.error('Error logging meal:', error);
    res.status(500).json({ message: 'Failed to log meal' });
  }
};

// @desc    Get today's meal log with daily totals and targets
// @route   GET /api/meals/today
// @access  Private
const getTodayLog = async (req, res) => {
  const today = getTodayString();

  try {
    const mealLog = await MealLog.findOne({ user: req.user._id, date: today });
    const targets = calculateDailyTarget(req.user);

    const meals = mealLog ? mealLog.meals : [];

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.calories,
        protein: acc.protein + meal.protein,
        carbs: acc.carbs + meal.carbs,
        fats: acc.fats + meal.fats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 }
    );

    res.json({
      date: today,
      meals,
      totals,
      targets,
    });
  } catch (error) {
    console.error('Error getting today log:', error);
    res.status(500).json({ message: 'Failed to fetch daily log' });
  }
};

// @desc    Delete a meal from today's log
// @route   DELETE /api/meals/:mealId
// @access  Private
const deleteMeal = async (req, res) => {
  const today = getTodayString();

  try {
    const mealLog = await MealLog.findOne({ user: req.user._id, date: today });

    if (!mealLog) {
      return res.status(404).json({ message: 'No meals logged today' });
    }

    mealLog.meals = mealLog.meals.filter(
      (meal) => meal._id.toString() !== req.params.mealId
    );

    await mealLog.save();
    res.json(mealLog);
  } catch (error) {
    console.error('Error deleting meal:', error);
    res.status(500).json({ message: 'Failed to delete meal' });
  }
};

module.exports = { logMeal, getTodayLog, deleteMeal };
