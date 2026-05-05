const { GoogleGenerativeAI } = require('@google/generative-ai');

const getBarcodeDetails = async (req, res) => {
  const { barcode } = req.params;

  try {
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status !== 1) {
      return res.status(404).json({ message: 'Product not found in OpenFoodFacts database' });
    }

    const product = data.product;
    const nutriments = product.nutriments || {};

    const result = {
      productName: product.product_name || 'Unknown Product',
      calories: nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 0,
      protein: nutriments.proteins_100g || nutriments.proteins || 0,
      carbs: nutriments.carbohydrates_100g || nutriments.carbohydrates || 0,
      fats: nutriments.fat_100g || nutriments.fat || 0,
      aiEstimate: false,
      image: product.image_front_url || null,
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching barcode data' });
  }
};

const analyzeImage = async (req, res) => {
  const { imageBase64 } = req.body;

  if (!imageBase64) {
    return res.status(400).json({ message: 'No image provided' });
  }

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ message: 'GEMINI_API_KEY is missing in backend/.env' });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const systemPrompt = `You are a nutrition expert AI inside the nutriScan app. 
Analyze the food in the provided image.
Estimate the portion size and calculate the total macronutrients for the entire visible meal.
Return ONLY a valid, raw JSON object (without markdown code blocks) with the following exact keys and types:
{
  "productName": "A descriptive name of the meal",
  "calories": 120,
  "protein": 10,
  "carbs": 20,
  "fats": 5
}
Do not include any other text or formatting.`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: systemPrompt
    });

    // Ensure we send raw base64 data to Gemini
    let base64Data = imageBase64;
    let mimeType = 'image/jpeg';
    
    if (imageBase64.includes(';base64,')) {
      const parts = imageBase64.split(';base64,');
      mimeType = parts[0].split(':')[1];
      base64Data = parts[1];
    }

    const imageParts = [
      {
        inlineData: {
          data: base64Data,
          mimeType
        }
      }
    ];

    const result = await model.generateContent(imageParts);
    const responseText = result.response.text();
    
    // Robust JSON extraction using regex
    let nutritionData;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const cleanJsonString = jsonMatch ? jsonMatch[0] : responseText;
      nutritionData = JSON.parse(cleanJsonString);
    } catch (parseError) {
      console.error('JSON Parse Error. Raw response:', responseText);
      throw new Error('AI returned invalid format. Please try again.');
    }

    res.json({
      productName: nutritionData.productName || 'Unknown Meal',
      calories: Number(nutritionData.calories) || 0,
      protein: Number(nutritionData.protein) || 0,
      carbs: Number(nutritionData.carbs) || 0,
      fats: Number(nutritionData.fats) || 0,
      aiEstimate: true,
      image: imageBase64 // Echo back the image for display
    });

  } catch (error) {
    console.error('Error in analyzeImage:', error);
    res.status(500).json({ 
      message: 'Failed to analyze image using AI.',
      error: error.message 
    });
  }
};

module.exports = { getBarcodeDetails, analyzeImage };
