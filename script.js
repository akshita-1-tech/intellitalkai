// =============================
// IntelliTalk AI
// =============================

// ---------- CLOCK ----------

function updateClock() {

    const clock = document.getElementById("clock");

    if (clock) {

        clock.innerHTML = new Date().toLocaleTimeString();

    }

}

setInterval(updateClock,1000);
updateClock();


// ---------- SCREEN CHANGE ----------

function showScreen(id){

    document.querySelectorAll(".screen").forEach(screen=>{

        screen.classList.remove("active");

    });

    document.getElementById(id).classList.add("active");

}


// ---------- SCREEN 1 ----------

document.getElementById("enterBtn").onclick=function(){

    showScreen("screen2");

};


// ---------- SCREEN 2 ----------

let selectedLanguage="English";

const translatorSourceSelect = document.getElementById("translatorSourceSelect");
const translatorTargetsContainer = document.getElementById("translatorTargets");
const translatorInput = document.getElementById("translatorInput");
const translateBtn = document.getElementById("translateBtn");
const targetLabel1 = document.getElementById("targetLabel1");
const targetLabel2 = document.getElementById("targetLabel2");
const translationResult1 = document.getElementById("translationResult1");
const translationResult2 = document.getElementById("translationResult2");
const translationResults = document.getElementById("translationResults");
const translatorOpenBtn = document.getElementById("translatorOpenBtn");
const translateUrl = "https://intellitalkai.onrender.com/translate";

function getEffectiveSourceLanguage() {
    const preferredLanguage = selectedLanguage || translatorSourceSelect?.value || "English";
    if (translatorSourceSelect && translatorSourceSelect.value !== preferredLanguage) {
        translatorSourceSelect.value = preferredLanguage;
    }
    selectedLanguage = preferredLanguage;
    return preferredLanguage;
}

function getTranslatorTargetOptions(language) {
    const lang = String(language || "English").toLowerCase();
    if (lang.includes("telugu")) {
        return ["English", "Hindi"];
    }
    if (lang.includes("hindi")) {
        return ["English", "Telugu"];
    }
    return ["Telugu", "Hindi"];
}

function getSelectedTranslatorTargets() {
    if (!translatorTargetsContainer) return [];
    return Array.from(translatorTargetsContainer.querySelectorAll(".target-chip.active")).map(button => button.dataset.lang);
}

function renderTranslatorTargets(sourceLanguage) {
    if (!translatorTargetsContainer) return;
    const targetOptions = getTranslatorTargetOptions(sourceLanguage);
    translatorTargetsContainer.innerHTML = targetOptions.map(lang => {
        return `<button type="button" class="target-chip active" data-lang="${lang}">${lang}</button>`;
    }).join("");
}

function updateTranslatorScreen() {
    const sourceLabel = getEffectiveSourceLanguage();
    const targetOptions = getTranslatorTargetOptions(sourceLabel);

    if (translatorSourceSelect) {
        translatorSourceSelect.value = sourceLabel;
    }
    renderTranslatorTargets(sourceLabel);

    if (targetLabel1) {
        targetLabel1.textContent = targetOptions[0];
    }
    if (targetLabel2) {
        targetLabel2.textContent = targetOptions[1];
    }
    if (translationResult1) {
        translationResult1.textContent = "";
    }
    if (translationResult2) {
        translationResult2.textContent = "";
    }
    if (translationResults) {
        translationResults.classList.add("hidden");
    }
    if (translatorInput) {
        translatorInput.value = "";
        translatorInput.placeholder = `Type text in ${sourceLabel}...`;
    }
}

function setupTargetChipEvents() {
    // Target chips are informational display elements.
    // Always translate into the default target languages for the selected source.
}

document.querySelectorAll(".lang-card").forEach(card=>{

    card.onclick=function(){

        document.querySelectorAll(".lang-card").forEach(c=>{

            c.classList.remove("selected");

        });

        this.classList.add("selected");

        selectedLanguage = this.innerText.replace(/^[^A-Za-z0-9]*/g, "").trim();

        updateTranslatorScreen();
    };

});

if (translatorSourceSelect) {
    translatorSourceSelect.onchange = function () {
        selectedLanguage = this.value;
        updateTranslatorScreen();
    };
}

setupTargetChipEvents();

document.getElementById("languageContinue").onclick=function(){

    updateTranslatorScreen();
    showScreen("screen4");

};

document.getElementById("translatorBack").onclick = function () {
    showScreen("screen8");
};

document.getElementById("translatorContinue").onclick = function () {
    showScreen("screen8");
};

if (translatorOpenBtn) {
    translatorOpenBtn.onclick = function () {
        updateTranslatorScreen();
        showScreen("screen3");
    };
}

const translatorChatBack = document.getElementById("translatorChatBack");
if (translatorChatBack) {
    translatorChatBack.onclick = function () {
        showScreen("screen8");
    };
}

if (translateBtn) {
    translateBtn.onclick = async function () {
        const text = translatorInput.value.trim();
        if (!text) return;

        const sourceLanguage = getEffectiveSourceLanguage();
        const targets = getTranslatorTargetOptions(sourceLanguage);

        if (translationResult1) translationResult1.textContent = "Translating...";
        if (translationResult2) translationResult2.textContent = "Translating...";

        try {
            const response = await fetch(translateUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    sourceLanguage,
                    targets,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Translate API error", response.status, errorText);
                if (translationResults) {
                    translationResults.classList.remove("hidden");
                }
                if (translationResult1) translationResult1.textContent = "Translation failed.";
                if (translationResult2) translationResult2.textContent = `API ${response.status}`;
                return;
            }
            const data = await response.json();
            if (translationResults) {
                translationResults.classList.remove("hidden");
            }
            if (data?.translations) {
                if (translationResult1) translationResult1.textContent = data.translations[targets[0]] || "No translation available.";
                if (translationResult2) translationResult2.textContent = data.translations[targets[1]] || "No translation available.";
            } else if (data?.error) {
                if (translationResult1) translationResult1.textContent = data.error;
                if (translationResult2) translationResult2.textContent = "";
            } else {
                if (translationResult1) translationResult1.textContent = "Unable to translate.";
                if (translationResult2) translationResult2.textContent = "";
            }
        } catch (error) {
            if (translationResults) {
                translationResults.classList.remove("hidden");
            }
            if (translationResult1) translationResult1.textContent = "Translation failed.";
            if (translationResult2) translationResult2.textContent = "Translation failed.";
            console.error(error);
        }
    };
}


// ---------- SCREEN 3 ----------

let selectedTheme="Neon Blue";

document.querySelectorAll(".theme-card").forEach(card=>{

    card.onclick=function(){

        document.querySelectorAll(".theme-card").forEach(c=>{

            c.classList.remove("selected");

        });

        this.classList.add("selected");

        if(this.classList.contains("neon")){

            document.body.style.background="#050816";
            selectedTheme="Neon Blue";

        }

        else if(this.classList.contains("purple")){

            document.body.style.background="#240046";
            selectedTheme="Cyber Purple";

        }

        else if(this.classList.contains("ocean")){

            document.body.style.background="#003049";
            selectedTheme="Ocean";

        }

        else if(this.classList.contains("dark")){

            document.body.style.background="#111111";
            selectedTheme="Dark AI";

        }

        else{

            document.body.style.background="#5a189a";
            selectedTheme="Aurora";

        }

    };

});
// Theme Back

document.getElementById("themeBack").onclick=function(){

    showScreen("screen3");

};
document.getElementById("themeContinue").onclick=function(){

    showScreen("screen5");

};


// ---------- SCREEN 4 ----------

let selectedMode="AI Assistant";

document.querySelectorAll(".mode-card").forEach(card=>{

    card.onclick=function(){

        document.querySelectorAll(".mode-card").forEach(c=>{

            c.classList.remove("selected");

        });

        this.classList.add("selected");

        selectedMode = this.dataset.mode || this.textContent.replace(/\n/g, " ").trim();

    };

});

document.getElementById("modeContinue").onclick=function(){

    document.getElementById("summaryLanguage").innerText=selectedLanguage;

    document.getElementById("summaryTheme").innerText=selectedTheme;

    document.getElementById("summaryMode").innerText=selectedMode;

    showScreen("screen6");

};

// ---------- BACK BUTTONS ----------

// Screen 4 → Screen 3

document.getElementById("modeBack").onclick=function(){

    showScreen("screen3");

};

// Screen 6 → Screen 5

document.getElementById("confirmBack").onclick=function(){

    showScreen("screen5");

};

// START AI

function getWelcomeMessage() {
    if (selectedLanguage.toLowerCase().includes("telugu")) {
        return "హాయ్! నేను IntelliTalk AI. నేను మీకు ఎలా సహాయపడగలను?";
    }
    if (selectedLanguage.toLowerCase().includes("hindi")) {
        return "नमस्ते! मैं IntelliTalk AI हूँ। मैं आपकी कैसे मदद कर सकता हूँ?";
    }
    return "Hello! I'm IntelliTalk AI. How can I help you today?";
}

document.getElementById("startAI").onclick = function () {

    showScreen("screen7");

    setTimeout(function () {

        chatBox.innerHTML = "";
        addMessage(getWelcomeMessage(), "bot");
        showScreen("screen8");

    }, 2500);

};

// ======================================
// AI CHAT
// ======================================

const chatBox = document.getElementById("chatBox");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");
const chatStatus = document.querySelector(".chat-status");

// Add Message Function

function addMessage(message, sender){

    const msg = document.createElement("div");

    msg.className = sender + "-message";

    msg.innerHTML = message;

    chatBox.appendChild(msg);

    chatBox.scrollTop = chatBox.scrollHeight;

}

// Typing Animation

function showTyping(){

    const typing = document.createElement("div");

    typing.className = "typing";

    typing.id = "typing";

    typing.innerHTML = `
        <span></span>
        <span></span>
        <span></span>
    `;

    chatBox.appendChild(typing);

    chatBox.scrollTop = chatBox.scrollHeight;

}

function removeTyping(){

    const typing = document.getElementById("typing");

    if(typing){

        typing.remove();

    }

}

let speechVoices = [];

function loadSpeechVoices() {
    speechVoices = window.speechSynthesis.getVoices() || [];
    console.log("Speech voices loaded:", speechVoices.map((v) => `${v.name} (${v.lang})`));
}

function waitForSpeechVoices() {
    return new Promise((resolve) => {
        const voices = window.speechSynthesis.getVoices();
        if (voices && voices.length > 0) {
            loadSpeechVoices();
            return resolve();
        }

        const handler = () => {
            loadSpeechVoices();
            window.speechSynthesis.removeEventListener("voiceschanged", handler);
            resolve();
        };

        window.speechSynthesis.addEventListener("voiceschanged", handler);
        setTimeout(() => {
            loadSpeechVoices();
            window.speechSynthesis.removeEventListener("voiceschanged", handler);
            resolve();
        }, 1000);
    });
}

if (window.speechSynthesis) {
    loadSpeechVoices();
    window.speechSynthesis.onvoiceschanged = loadSpeechVoices;
}

function getSpeechVoice(langCode) {
    const voices = speechVoices.length ? speechVoices : window.speechSynthesis.getVoices() || [];
    if (!voices || voices.length === 0) {
        return null;
    }

    const langLower = langCode.toLowerCase();
    const exactMatch = voices.find((v) => v.lang.toLowerCase() === langLower);
    if (exactMatch) return exactMatch;

    const prefixMatch = voices.find((v) => v.lang.toLowerCase().startsWith(langLower));
    if (prefixMatch) return prefixMatch;

    const containsMatch = voices.find((v) => v.lang.toLowerCase().includes(langLower));
    if (containsMatch) return containsMatch;

    const shortCode = langLower.split("-")[0];
    const shortMatch = voices.find((v) => v.lang.toLowerCase().startsWith(shortCode));
    if (shortMatch) return shortMatch;

    return voices.find((v) => v.lang.toLowerCase().startsWith("en")) || voices[0];
}

function getSpeechVoiceForLanguage(language) {
    const lang = String(language || selectedLanguage || "English").toLowerCase();
    if (lang.includes("telugu")) {
        return getSpeechVoice("te-IN") || getSpeechVoice("hi-IN") || getSpeechVoice("en-US");
    }
    if (lang.includes("hindi")) {
        return getSpeechVoice("hi-IN") || getSpeechVoice("en-US");
    }
    return getSpeechVoice("en-US");
}



async function speakText(text, language = null, profile = null){
    if (!window.speechSynthesis || !text) return;

    const cleanText = String(text).trim();
    if (!cleanText) return;

    try {
        await waitForSpeechVoices();
    } catch (error) {
        console.warn("Speech voice list could not be loaded:", error);
    }

    if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    const lang = String(language || selectedLanguage || "English").toLowerCase();

    let targetLang = "en-US";
    if (lang.includes("telugu")) {
        targetLang = "te-IN";
    } else if (lang.includes("hindi")) {
        targetLang = "hi-IN";
    }

    let voice = getSpeechVoiceForLanguage(lang);
    if (!voice) {
        voice = getSpeechVoice("en-US");
    }

    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || targetLang;
    } else {
        utterance.lang = targetLang;
    }

    if (targetLang === "te-IN" && (!voice || voice.lang?.toLowerCase() !== "te-in")) {
        console.warn("No Telugu voice available; falling back to another installed voice for speech playback.");
    }

    utterance.rate = profile?.rate || 1;
    utterance.pitch = profile?.pitch || 1;
    utterance.volume = profile?.volume || 1;
    utterance.onerror = function(event) {
        console.error("Speech error:", event.error || event);
    };

    console.log("Speech utterance:", { text: cleanText, lang: utterance.lang, voice: voice?.name || "default", profile });

    window.speechSynthesis.cancel();
    window.speechSynthesis.resume();
    window.speechSynthesis.speak(utterance);

    await new Promise((resolve) => {
        utterance.onend = resolve;
        utterance.onerror = resolve;
        setTimeout(resolve, 4000);
    });
}

// Send Message

async function sendMessage(){
    console.log("===== SEND MESSAGE CALLED =====");
    const message = userInput.value.trim();
    console.log("Message from input:", message);

    if(message==="") {
        console.log("Message is empty, returning");
        return;
    }

    console.log("Adding user message to chat");
    addMessage(message,"user");
    console.log("User message added");

    userInput.value="";
    console.log("Input cleared");

    console.log("Showing typing indicator");
    showTyping();

    try{
        console.log("Fetching /chat with:", {message, language: selectedLanguage, mode: selectedMode});
        const response = await fetch("https://intellitalkai.onrender.com/chat",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                message:message,
                language:selectedLanguage,
                mode:selectedMode
            })
        });
        
        console.log("Response received, status:", response.status);
        console.log("Sending chat request:", { message, language: selectedLanguage, mode: selectedMode });

        const data = await response.json();
        console.log("Chat response data:", data);

        removeTyping();
        console.log("Typing indicator removed");

        const botReply = data?.reply || data?.message || "Unable to parse AI response.";
        console.log("Bot reply:", botReply);
        
        addMessage(botReply, "bot");
        console.log("Bot message added to chat");
        
        speakText(botReply);
        console.log("Speech synthesis triggered");

    }
    catch(error){
        console.error("===== ERROR IN SEND MESSAGE =====", error);
        removeTyping();

        addMessage("❌ Unable to contact AI.","bot");

        console.error(error);

    }

}

// Send Button

sendBtn.onclick=function(){

    sendMessage();

};

// Press Enter

userInput.addEventListener("keypress",function(e){

    if(e.key==="Enter"){

        sendMessage();

    }

});

const micBtn = document.getElementById("micBtn");
const micStatus = document.getElementById("micStatus");
const translatorMicBtn = document.getElementById("translatorMicBtn");
const translatorMicStatus = document.getElementById("translatorMicStatus");
const translatorSpeakBtn = document.getElementById("translatorSpeakBtn");
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;
let isRecognitionActive = false;
let activeMicStream = null;

function getSpeechLanguageCode(language) {
    const lang = String(language || "English").toLowerCase();
    if (lang.includes("telugu")) return "te-IN";
    if (lang.includes("hindi")) return "hi-IN";
    return "en-US";
}

function getRecognitionLanguageFromActiveScreen() {
    const activeScreen = document.querySelector('.screen.active')?.id;
    const sourceLanguage = getEffectiveSourceLanguage();
    const lang = String(sourceLanguage || "English").toLowerCase();

    if (activeScreen === "screen3" && lang.includes("telugu")) {
        return "te-IN";
    }
    if (activeScreen === "screen3" && lang.includes("hindi")) {
        return "hi-IN";
    }
    if (lang.includes("telugu")) {
        return "te-IN";
    }
    if (lang.includes("hindi")) {
        return "hi-IN";
    }

    const browserLang = (navigator.language || "en-IN").trim();
    if (browserLang) {
        return browserLang;
    }
    return "en-IN";
}

function speakTranslatedText(text) {
    if (!window.speechSynthesis || !text) return;

    const utterance = new SpeechSynthesisUtterance(String(text).trim());
    const langCode = getSpeechLanguageCode(getEffectiveSourceLanguage());
    const voice = getSpeechVoiceForLanguage(getEffectiveSourceLanguage()) || getSpeechVoice("en-US");

    if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang || langCode;
    } else {
        utterance.lang = langCode;
    }

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

function updateMicStatus(message, isError = false) {
    const text = String(message || "");
    if (micStatus) {
        micStatus.innerHTML = text;
        micStatus.style.color = isError ? "#ff6b6b" : "#4fc3f7";
    }
    if (translatorMicStatus) {
        translatorMicStatus.innerHTML = text;
        translatorMicStatus.style.color = isError ? "#ff6b6b" : "#4fc3f7";
    }
}

function isElectronLikeBrowser() {
    return /electron/i.test(navigator.userAgent || "") || !!window.process?.versions?.electron;
}

async function checkMicAvailability() {
    if (!navigator.mediaDevices?.getUserMedia) {
        return { ok: false, reason: "no-media-devices" };
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            }
        });
        stream.getTracks().forEach((track) => track.stop());
        return { ok: true, reason: "ok" };
    } catch (error) {
        const message = String(error?.message || error || "unknown");
        return { ok: false, reason: message };
    }
}

async function getMicStreamWithFallback() {
    if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("no-media-devices");
    }

    const baseConstraints = {
        audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
            channelCount: 1,
        }
    };

    try {
        const defaultStream = await navigator.mediaDevices.getUserMedia(baseConstraints);
        console.log("Microphone stream acquired from default browser input.");
        return defaultStream;
    } catch (error) {
        console.warn("Default microphone request failed; trying browser-selected input.", error);
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true,
            }
        });
        console.log("Microphone stream acquired using browser-selected input.");
        return stream;
    } catch (fallbackError) {
        console.warn("Browser-selected input also failed.", fallbackError);
    }

    throw new Error("No microphone stream available");
}

async function startRecognition() {
    if (isElectronLikeBrowser()) {
        updateMicStatus("⚠️ Voice input is not reliable in this embedded browser. Please open the app in Chrome or Edge desktop, allow microphone access, and try again.", true);
        fallbackVoiceInput();
        return;
    }

    if (!recognition) {
        recognition = new window.SpeechRecognition() || new window.webkitSpeechRecognition();
    }

    if (!recognition) {
        updateMicStatus("⚠️ Speech recognition is not available in this browser", true);
        return;
    }

    if (isRecognitionActive) {
        try {
            recognition.stop();
            console.log("Stopped active recognition");
        } catch (error) {
            console.warn("Unable to stop recognition:", error);
        }
        return;
    }

    if (!window.isSecureContext && location.hostname !== "localhost" && location.hostname !== "127.0.0.1") {
        updateMicStatus("⚠️ Microphone requires HTTPS or localhost", true);
        return;
    }

    try {
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 3;
        recognition.lang = getRecognitionLanguageFromActiveScreen();
        console.log("Recognition language set to:", recognition.lang);
    } catch (error) {
        console.warn("Could not set language:", error);
    }

    if (chatStatus) {
        chatStatus.innerText = "🎙 Listening for speech";
    }

    updateMicStatus("🎙 Requesting microphone access...");

    try {
        const micCheck = await checkMicAvailability();
        console.log("Microphone availability check:", micCheck);
        if (!micCheck.ok) {
            throw new Error(micCheck.reason);
        }

        if (activeMicStream) {
            activeMicStream.getTracks().forEach((track) => track.stop());
            activeMicStream = null;
        }

        activeMicStream = await getMicStreamWithFallback();
        recognition.start();
        updateMicStatus("🎙 Listening... Speak now");
        console.log("Recognition start() called");
    } catch (error) {
        console.error("Microphone could not start:", error);
        updateMicStatus("⚠️ Microphone access failed. The browser could not capture the default microphone. Please allow permission in the browser and check Windows microphone settings.", true);
        if (userInput) {
            userInput.focus();
            userInput.setAttribute("placeholder", "Type your message here instead");
        }
        if (translatorInput) {
            translatorInput.focus();
            translatorInput.setAttribute("placeholder", "Type text here instead");
        }
    }
}

function fallbackVoiceInput() {
    const activeScreen = document.querySelector('.screen.active')?.id;
    const languageName = String(getEffectiveSourceLanguage() || "English");
    const isTelugu = languageName.toLowerCase().includes("telugu");
    const promptText = activeScreen === 'screen3'
        ? (isTelugu
            ? 'Telugu voice capture is not being recognized by this browser. Please type the text manually.'
            : 'Voice capture is unavailable in this browser. Please type the text manually.')
        : (isTelugu
            ? 'Telugu voice capture is not being recognized by this browser. Please type your message manually.'
            : 'Voice capture is unavailable in this browser. Please type your message manually.');

    updateMicStatus(promptText, true);

    if (activeScreen === 'screen3' && translatorInput) {
        translatorInput.focus();
    } else if (userInput) {
        userInput.focus();
    }
}

async function testMicInput() {
    if (!navigator.mediaDevices?.getUserMedia) {
        return { ok: false, reason: 'no-media-devices' };
    }

    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(dataArray);
        const volume = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
        stream.getTracks().forEach((track) => track.stop());
        audioContext.close();
        return { ok: volume > 10, volume };
    } catch (error) {
        return { ok: false, reason: String(error?.message || error) };
    }
}

if (!SpeechRecognition) {
    updateMicStatus("Speech recognition not supported", true);
    if (micBtn) micBtn.disabled = true;
} else {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = "en-US";

    micBtn.onclick = function(event) {
        event.preventDefault();
        void startRecognition();
    };

    if (translatorMicBtn) {
        translatorMicBtn.onclick = function(event) {
            event.preventDefault();
            void startRecognition();
        };
    }

    if (micBtn) {
        micBtn.setAttribute('title', 'Use microphone for voice input');
    }
    if (translatorMicBtn) {
        translatorMicBtn.setAttribute('title', 'Use microphone for translator input');
    }

    if (translatorSpeakBtn) {
        translatorSpeakBtn.onclick = async function() {
            console.log("Translator speak button clicked");

            const readResults = async () => {
                const result1 = translationResult1?.textContent || "";
                const result2 = translationResult2?.textContent || "";
                const label1 = targetLabel1?.textContent || "";
                const label2 = targetLabel2?.textContent || "";

                console.log("Result 1:", result1, "Label 1:", label1);
                console.log("Result 2:", result2, "Label 2:", label2);

                if (!result1 && !result2) {
                    console.log("No translation results to speak");
                    return;
                }

                const speakResult = async (text, label) => {
                    if (!text || text.includes("Translating") || text.includes("failed") || text.includes("No translation")) return;

                    const labelLower = String(label || "").toLowerCase();
                    let langCode = "en-US";
                    if (labelLower.includes("telugu")) langCode = "te-IN";
                    else if (labelLower.includes("hindi")) langCode = "hi-IN";

                    const utterance = new SpeechSynthesisUtterance(String(text).trim());
                    const voice = getSpeechVoiceForLanguage(labelLower) || getSpeechVoice(langCode) || getSpeechVoice("en-US");
                    if (voice) {
                        utterance.voice = voice;
                        utterance.lang = voice.lang || langCode;
                    } else {
                        utterance.lang = langCode;
                    }
                    utterance.rate = 1;
                    utterance.pitch = 1;
                    utterance.volume = 1;
                    window.speechSynthesis.cancel();
                    window.speechSynthesis.speak(utterance);
                    await new Promise((resolve) => {
                        utterance.onend = resolve;
                        utterance.onerror = resolve;
                        setTimeout(resolve, 4000);
                    });
                };

                if (result1 && !result1.includes("failed")) {
                    await speakResult(result1, label1);
                }

                if (result2 && !result2.includes("failed")) {
                    await speakResult(result2, label2);
                }
            };

            try {
                await readResults();
                setTimeout(readResults, 800);
                console.log("Translation audio playback completed");
            } catch (error) {
                console.error("Error speaking translations:", error);
            }
        };
    }

    recognition.onstart = function() {
        isRecognitionActive = true;
        updateMicStatus("🎙 Listening...");
        console.log("Speech recognition started, language:", recognition.lang);
    };

    recognition.onresult = function(event){
        console.log("===== SPEECH RESULT EVENT FIRED =====");
        console.log("Result event:", event);
        console.log("Results length:", event.results.length);
        console.log("Result index:", event.resultIndex);
        
        let transcript = "";
        let isFinal = false;
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const alt = event.results[i][0].transcript;
            transcript += alt;
            console.log(`  [${i}] "${alt}" - isFinal: ${event.results[i].isFinal}`);
            if (event.results[i].isFinal) {
                isFinal = true;
            }
        }
        
        const voiceText = String(transcript || "").trim();
        console.log("Combined transcript:", voiceText);
        console.log("IsFinal:", isFinal);
        
        if (!voiceText) {
            console.log("No transcript captured");
            return;
        }

        console.log("Setting input value to:", voiceText);
        
        // Check which screen is active
        const screen3Active = document.getElementById("screen3")?.classList.contains("active");
        const screen8Active = document.getElementById("screen8")?.classList.contains("active");
        console.log("Screen 3 (translator) active:", screen3Active);
        console.log("Screen 8 (chat) active:", screen8Active);

        if (screen3Active && translatorInput) {
            console.log("Translator screen active - setting translatorInput");
            translatorInput.value = voiceText;
            updateMicStatus("✅ " + voiceText);
            
            // Auto-translate after capturing speech
            if (isFinal && voiceText) {
                console.log("Auto-triggering translation after microphone capture");
                setTimeout(() => {
                    if (translateBtn) {
                        console.log("Clicking translate button");
                        translateBtn.click();
                    }
                }, 500);
            }
        } else if (screen8Active && userInput) {
            console.log("Chat screen active - setting userInput");
            userInput.value = voiceText;
            console.log("Verified userInput.value is now:", userInput.value);
            updateMicStatus("✅ " + voiceText);
            
            if (isFinal) {
                console.log("FINAL RESULT - Calling sendMessage()");
                try {
                    sendMessage();
                    console.log("sendMessage() executed successfully");
                } catch (error) {
                    console.error("Error calling sendMessage():", error);
                }
            }
        } else {
            console.log("Default: setting userInput");
            userInput.value = voiceText;
            console.log("Verified userInput.value is now:", userInput.value);
            updateMicStatus("✅ " + voiceText);
            
            if (isFinal) {
                console.log("FINAL RESULT - Calling sendMessage()");
                try {
                    sendMessage();
                    console.log("sendMessage() executed successfully");
                } catch (error) {
                    console.error("Error calling sendMessage():", error);
                }
            }
        }
    };

    recognition.onerror = function(event){
        isRecognitionActive = false;
        if (activeMicStream) {
            activeMicStream.getTracks().forEach((track) => track.stop());
            activeMicStream = null;
        }
        console.error("Speech recognition error:", event.error);
        let message = "❌ Microphone error: " + (event.error || "unknown");
        if (event.error === "not-allowed") {
            message = "⚠️ Microphone permission denied. Check browser settings.";
        } else if (event.error === "network") {
            if (isElectronLikeBrowser()) {
                message = "⚠️ Voice input is blocked in this embedded browser. Please open the app in Chrome or Edge desktop and allow microphone access.";
            } else {
                message = "⚠️ Network error in speech recognition. Check your internet connection and microphone settings.";
            }
        } else if (event.error === "no-speech") {
            void testMicInput().then((result) => {
                if (result.ok) {
                    updateMicStatus("⚠️ The browser heard audio, but speech recognition still did not understand it. Please speak more clearly and ensure the correct microphone is selected.", true);
                } else {
                    updateMicStatus("⚠️ The browser is not receiving usable audio from your microphone. Please check the microphone device, Windows permissions, and browser site permissions, then try again.", true);
                }
            });
        } else if (event.error === "audio-capture") {
            message = "⚠️ No microphone available";
            fallbackVoiceInput();
        }
        updateMicStatus(message, true);
    };

    recognition.onend = function(){
        isRecognitionActive = false;
        if (activeMicStream) {
            activeMicStream.getTracks().forEach((track) => track.stop());
            activeMicStream = null;
        }
        console.log("Speech recognition ended");
        const screen3Active = document.getElementById("screen3")?.classList.contains("active");
        const screen8Active = document.getElementById("screen8")?.classList.contains("active");
        
        if (screen3Active) {
            if (translatorMicStatus && !translatorInput?.value) {
                updateMicStatus("Click microphone to speak");
            }
        } else if (screen8Active) {
            if (micStatus && !userInput?.value) {
                updateMicStatus("Click microphone to speak");
            }
            // Only send from chat screen if there's text
            if (userInput && userInput.value.trim()) {
                console.log("Auto-sending message from chat screen onend");
                // Note: actual sending happens from onresult when isFinal is true
            }
        } else {
            // Generic cleanup if not on specific screens
            if (micStatus) updateMicStatus("Click microphone to speak");
            if (translatorMicStatus) updateMicStatus("Click microphone to speak");
        }
    };
}

console.log("✅ IntelliTalk AI READY");
