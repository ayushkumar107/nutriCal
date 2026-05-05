const { GoogleGenerativeAI } = require('@google/generative-ai');
const MealLog = require('../models/MealLog');

// Helper: get today's date string
const getTodayString = () => new Date().toISOString().split('T')[0];

// @desc    Chat with AI Diet Coach
// @route   POST /api/chat
// @access  Private
const chatWithCoach = async (req, res) => {
  const { message, history } = req.body;

  if (!message) {
    return res.status(400).json({ message: 'Message is required' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: 'GEMINI_API_KEY is missing in backend/.env' });
  }

  try {
    const user = req.user;
    const today = getTodayString();
    const mealLog = await MealLog.findOne({ user: user._id, date: today });

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

    // Calculate targets
    let bmr = 10 * (user.weight || 70) + 6.25 * (user.height || 170) - 5 * (user.age || 25) + 5;
    let tdee = Math.round(bmr * 1.55);
    let calorieTarget;
    switch (user.goal) {
      case 'Bulking': calorieTarget = tdee + 500; break;
      case 'Cutting': calorieTarget = tdee - 500; break;
      default: calorieTarget = tdee;
    }

    const mealsList = meals.map((m, i) =>
      `  ${i + 1}. ${m.productName} — ${m.calories} kcal, ${m.protein}g protein, ${m.carbs}g carbs, ${m.fats}g fats`
    ).join('\n');

    const systemPrompt = `You are NutriCoach, a friendly, expert AI diet coach inside the nutriScan app. 
You speak casually but knowledgeably — like a personal trainer texting their client.
Keep responses concise (2-4 short paragraphs max).

USER PROFILE:
- Name: ${user.name}
- Age: ${user.age || 'Unknown'}
- Weight: ${user.weight || 'Unknown'} kg
- Height: ${user.height || 'Unknown'} cm
- Fitness Goal: ${user.goal}
- Daily Calorie Target: ${calorieTarget} kcal

TODAY'S MEALS (${today}):
${meals.length === 0 ? '  No meals logged yet today.' : mealsList}

TODAY'S TOTALS:
  Calories: ${Math.round(totals.calories)} / ${calorieTarget} kcal
  Protein: ${Math.round(totals.protein)}g
  Carbs: ${Math.round(totals.carbs)}g
  Fats: ${Math.round(totals.fats)}g
  Remaining Calories: ${calorieTarget - Math.round(totals.calories)} kcal

RULES:
- Always factor in the user's goal (${user.goal}) when giving advice.
- If they ask "what should I eat", suggest specific meals with estimated calories that fit their remaining budget.
- If they describe a meal, estimate the macros and tell them if it's good for their goal.
- Be encouraging but honest.
- Never diagnose medical conditions.
- If the user asks something unrelated to nutrition/fitness, gently redirect them.`;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      systemInstruction: systemPrompt
    });

    const chatSession = model.startChat({
      history: history ? history.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      })) : []
    });

    const result = await chatSession.sendMessage(message);
    const responseText = result.response.text();

    res.json({
      reply: responseText,
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'AI Coach is temporarily unavailable.' });
  }
};

module.exports = { chatWithCoach };
