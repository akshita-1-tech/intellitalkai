console.log("🔥 IntelliTalk AI SERVER STARTING...");

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
console.log("Gemini key loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");
//console.log("API KEY:", process.env.GEMINI_API_KEY);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const MODEL = "gemini-flash-lite-latest";
const FALLBACK_MODEL = "gemini-2.0-flash-lite";
const TRANSIENT_STATUSES = new Set(["UNAVAILABLE", "RESOURCE_EXHAUSTED"]);

function isTransientGeminiError(err) {
  const status = err?.response?.data?.error?.status;
  const code = err?.response?.data?.error?.code;
  return TRANSIENT_STATUSES.has(status) || code === 503 || code === 429;
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function detectLanguageFromText(text, fallbackLanguage) {
  const value = String(text || "").trim();
  if (!value) return fallbackLanguage;

  const teluguPattern = /[ఀ-౿]/u;
  const hindiPattern = /[ऀ-ॿ]/u;
  const englishPattern = /[a-zA-Z]/;

  if (teluguPattern.test(value)) return "Telugu";
  if (hindiPattern.test(value)) return "Hindi";
  if (englishPattern.test(value)) return "English";
  return fallbackLanguage;
}

function normalizeMode(mode) {
  const value = String(mode || "AI Assistant").trim();
  const modeMap = {
    "ai assistant": "AI Assistant",
    "assistant": "AI Assistant",
    
    "future me": "Future Me",
    "future": "Future Me",
    "pirate chat": "Pirate Chat",
    "pirate": "Pirate Chat",
    "meme generator": "Cheerful Mode",
    "meme": "Cheerful Mode",
    "cheerful mode": "Cheerful Mode",
    "cheerful": "Cheerful Mode",
    "life coach": "Life Coach",
    "coach": "Life Coach",
  };

  return modeMap[value.toLowerCase()] || value;
}

function buildModeInstruction(mode, language) {
  const normalizedMode = normalizeMode(mode);
  const languageLabel = language === "English" ? "English" : language;

  const instructions = {
    "AI Assistant": `Act as a helpful AI assistant. Be clear, practical, and friendly. Keep the reply concise and useful in ${languageLabel}.`,
    "Alien Translator": `Answer as a playful alien translator. Keep the meaning intact, but add a quirky extraterrestrial tone and light humor in ${languageLabel}.`,
    "Future Me": `Answer as a wise future version of the user who has already learned from experience. Give one clear insight, one practical next step, and one encouraging closing line in ${languageLabel}.`,
    "Pirate Chat": `Answer in a fun pirate voice with sea-themed words, but still be understandable in ${languageLabel}.`,
    "Cheerful Mode": `Respond in a light, playful, and upbeat style. Keep the answer friendly, positive, wholesome, and suitable for all audiences in ${languageLabel}. Avoid sarcasm, insults, or rude humor.`,
    "Life Coach": `Act as a supportive life coach. Help the user reflect on the situation, identify the key challenge, and offer a clear action plan. Be motivating, practical, and encouraging in ${languageLabel}.`,
  };

  return instructions[normalizedMode] || instructions["AI Assistant"];
}

function buildTranslationPrompt(text, sourceLanguage, targets) {
  const targetList = targets.join(" and ");
  const jsonKeys = targets.map((target) => `\"${target}\"`).join(", ");
  return `You are a translation assistant.
Translate the following text from ${sourceLanguage} into ${targetList}.
Return only a valid JSON object with keys ${jsonKeys} and values as the translated text.
Use the exact language names as keys in the JSON.
Do not add any commentary, explanation, or any extra text outside the JSON object.

Text: ${text}`;
}

function extractJsonObject(text) {
  if (!text || typeof text !== "string") return null;
  const match = text.match(/\{[\s\S]*\}$/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch (err) {
    console.warn("JSON parse failed after regex extraction", err);
    return null;
  }
}

async function generateAiResponse(message) {
  const models = [MODEL, FALLBACK_MODEL];
  let lastError;

  for (const model of models) {
    try {
      console.log(`Trying Gemini model: ${model}`);
      return await ai.models.generateContent({
        model,
        contents: message,
      });
    } catch (err) {
      lastError = err;
      console.error(`Model ${model} error:`, err?.message || err);
      if (!isTransientGeminiError(err) || model === FALLBACK_MODEL) {
        throw err;
      }
      console.log(`Transient Gemini issue detected for ${model}. Retrying with next model after delay...`);
      await wait(1000);
    }
  }

  throw lastError;
}

// ===============================
// HOME
// ===============================

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/public/index.html");
});

// ===============================
// TEST
// ===============================

app.get("/test", async (req, res) => {
  try {
    const models = await ai.models.list();
    res.json(models);
  } catch (err) {
    console.error(err);
    res.status(500).json({
      error: err.message,
    });
  }
});

// ===============================
// CHAT
// ===============================

app.get("/chat", (req, res) => {
  res.status(200).json({
    message: "Use POST /chat with a JSON body { message: 'your text' } to talk to the AI.",
  });
});

app.post("/translate", async (req, res) => {
  console.log("Translate request received", req.method, req.path, req.body);
  try {
    const { text, sourceLanguage = "English", targets = [] } = req.body;
    if (!text || !Array.isArray(targets) || targets.length === 0) {
      console.warn("Invalid translation request body", req.body);
      return res.status(400).json({ error: "Invalid translation request." });
    }

    const prompt = buildTranslationPrompt(text, sourceLanguage, targets);
    console.log("Translate prompt:", prompt);
    const response = await generateAiResponse(prompt);
    const raw = response.text || response.output_text || response.output?.[0]?.content?.[0]?.text || response.candidates?.[0]?.content?.parts?.[0]?.text || response.candidates?.[0]?.content?.[0]?.text || "";

    console.log("Translate raw response:", raw);

    let translations = extractJsonObject(raw?.trim());
    if (!translations) {
      console.warn("Translation JSON parse failed, falling back to raw text");
      translations = {};
      targets.forEach((target) => {
        translations[target] = raw.trim();
      });
    }

    return res.json({ translations });
  } catch (err) {
    console.error("Translate error:", err);
    res.status(500).json({ error: err.message || "Unable to translate." });
  }
});

app.post("/chat", async (req, res) => {

  console.log("==================================");
  console.log("CHAT endpoint called");

  try {

    const { message, language = "English", mode = "AI Assistant" } = req.body;

    console.log("User:", message);
    console.log("Selected language:", language);
    console.log("Selected mode:", mode);

    const requestedLanguage = String(language || "English").trim();
    const detectedLanguage = detectLanguageFromText(message, requestedLanguage);
    const normalizedLanguage = detectedLanguage.toLowerCase().includes("telugu")
      ? "Telugu"
      : detectedLanguage.toLowerCase().includes("hindi")
      ? "Hindi"
      : detectedLanguage.toLowerCase().includes("english")
      ? "English"
      : detectedLanguage;

    const normalizedMode = normalizeMode(mode);
    const scriptRule = normalizedLanguage === "Hindi"
      ? "Use Devanagari script only."
      : normalizedLanguage === "Telugu"
      ? "Use Telugu script only."
      : "Use standard Latin script.";

    const responseRule = normalizedLanguage === "English"
      ? "Reply in natural, clear English only. Do not use Telugu, Hindi, or other languages."
      : `Reply ONLY in ${normalizedLanguage}.`;

    const prompt = `You are IntelliTalk AI.
  The user's message language should determine the reply language.
  Detected language: ${normalizedLanguage}.
  ${responseRule}
  ${scriptRule}
  Do not switch languages mid-response.
  Mode: ${normalizedMode}.
  ${buildModeInstruction(normalizedMode, normalizedLanguage)}
  User: ${message}
  AI:`;

    const response = await generateAiResponse(prompt);

    console.log("FULL RESPONSE:");
    console.dir(response, { depth: null });

    const reply =
      response.text ||
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      response.candidates?.[0]?.content?.parts?.[0]?.text ||
      response.candidates?.[0]?.content?.[0]?.text ||
      response.output?.[0]?.content?.parts?.[0]?.text ||
      "Gemini returned no response.";

    console.log("Gemini Reply:", reply);
    console.log("Raw Gemini response shape:", JSON.stringify(response, null, 2));

    res.json({
      reply,
    });

  // } catch (err) {

  //   console.error("===== FULL GEMINI ERROR =====");
  //   console.dir(err, { depth: null });

  //   res.status(500).json({
  //     reply: "Unable to contact Gemini.",
  //   });

  } catch (err) {
    console.log("===== FULL GEMINI ERROR =====");
    console.error(err);
    if (err.response?.data) {
      console.error("ERROR RESPONSE DATA:", JSON.stringify(err.response.data, null, 2));
    }

    res.status(500).json({
      reply: err.message || "Unable to contact Gemini.",
    });
  }
});

// ===============================

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});