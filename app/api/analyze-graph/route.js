import { GoogleGenAI } from '@google/genai';

export async function POST(req) {
  try {
    const { imageBase64 } = await req.json();
    
    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "No image provided" }), { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Extract base64 data and mime type
    const base64Data = imageBase64.split(',')[1];
    const mimeType = imageBase64.split(';')[0].split(':')[1];

    const prompt = `Look at this engine performance graph or tuning screen from a racing game (like Forza). 
The X-axis shows RPM (x1000). The yellow line represents Power (hp) and the pink line represents Torque.
I need you to extract the following information if visible:
1. Peak Torque RPM: At what RPM does the pink line reach its highest point?
2. Peak Power RPM: At what RPM does the yellow line reach its highest point?
3. Redline RPM: At what RPM does the graph end on the right side?
4. Total Horsepower: The peak power number if visible in the stats (number only).
5. Weight: The weight of the car if visible in the stats (number only). Convert to kg if it's in lbs (1 lb = 0.453 kg) but just give the number.
6. Tire Compound: If the tire compound is visible in the text (e.g., "Stock", "Street", "Sport", "Semi Slick", "Slick", "Drift", "Drag", "Snow", "Rally", "Off-Road"). If not visible, return "Street".

Return ONLY a JSON object with these keys. Ensure it is valid JSON. For missing values, use null.
{"peakTorqueRpm": 4000, "peakPowerRpm": 8500, "redlineRpm": 9500, "horsepower": 300, "weight": 1200, "tireCompound": "Sport"}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        prompt,
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        }
      ]
    });

    const text = response.text;
    // Extract JSON from text (in case there are markdown backticks)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse AI response as JSON: " + text);
    }
    
    const result = JSON.parse(jsonMatch[0]);
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
    
  } catch (error) {
    console.error("API Error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
