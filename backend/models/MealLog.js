const mongoose = require('mongoose');

const mealSchema = mongoose.Schema({
  productName: { type: String, required: true },
  calories: { type: Number, default: 0 },
  protein: { type: Number, default: 0 },
  carbs: { type: Number, default: 0 },
  fats: { type: Number, default: 0 },
  aiEstimate: { type: Boolean, default: false },
  image: { type: String }, // base64 or URL (optional, stored as thumbnail)
  loggedAt: { type: Date, default: Date.now },
});

const mealLogSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: String, // YYYY-MM-DD format for easy daily grouping
      required: true,
    },
    meals: [mealSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for fast lookups
mealLogSchema.index({ user: 1, date: 1 }, { unique: true });

const MealLog = mongoose.model('MealLog', mealLogSchema);
module.exports = MealLog;
