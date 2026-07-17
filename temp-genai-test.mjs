import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const models = [
  'gemini-flash-latest',
  'gemini-flash-lite-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-2.5-pro',
  'gemini-3-pro-preview',
];

for (const model of models) {
  try {
    console.log(`Testing model: ${model}`);
    const response = await ai.models.generateContent({ model, contents: 'Hello from test' });
    console.log('SUCCESS:', model, response.text || JSON.stringify(response, null, 2));
    process.exit(0);
  } catch (e) {
    console.error('MODEL_FAILED:', model);
    console.error('ERR_NAME', e?.name);
    console.error('ERR_MESSAGE', e?.message);
    if (e?.response?.data) {
      console.error('ERR_RESPONSE_DATA', JSON.stringify(e.response.data, null, 2));
    } else if (e?.response) {
      console.error('ERR_RESPONSE', JSON.stringify(e.response, null, 2));
    }
  }
}
console.error('No tested model succeeded.');
process.exit(1);
