const LANGUAGES = [
  { code: "auto", label: "Detect language" },
  { code: "af", label: "Afrikaans" },
  { code: "sq", label: "Albanian" },
  { code: "am", label: "Amharic" },
  { code: "ar", label: "Arabic" },
  { code: "hy", label: "Armenian" },
  { code: "az", label: "Azerbaijani" },
  { code: "eu", label: "Basque" },
  { code: "be", label: "Belarusian" },
  { code: "bn", label: "Bengali" },
  { code: "bs", label: "Bosnian" },
  { code: "bg", label: "Bulgarian" },
  { code: "ca", label: "Catalan" },
  { code: "ceb", label: "Cebuano" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "zh-TW", label: "Chinese (Traditional)" },
  { code: "co", label: "Corsican" },
  { code: "hr", label: "Croatian" },
  { code: "cs", label: "Czech" },
  { code: "da", label: "Danish" },
  { code: "nl", label: "Dutch" },
  { code: "en", label: "English" },
  { code: "eo", label: "Esperanto" },
  { code: "et", label: "Estonian" },
  { code: "fi", label: "Finnish" },
  { code: "fr", label: "French" },
  { code: "fy", label: "Frisian" },
  { code: "gl", label: "Galician" },
  { code: "ka", label: "Georgian" },
  { code: "de", label: "German" },
  { code: "el", label: "Greek" },
  { code: "gu", label: "Gujarati" },
  { code: "ht", label: "Haitian Creole" },
  { code: "ha", label: "Hausa" },
  { code: "haw", label: "Hawaiian" },
  { code: "he", label: "Hebrew" },
  { code: "hi", label: "Hindi" },
  { code: "hmn", label: "Hmong" },
  { code: "hu", label: "Hungarian" },
  { code: "is", label: "Icelandic" },
  { code: "ig", label: "Igbo" },
  { code: "id", label: "Indonesian" },
  { code: "ga", label: "Irish" },
  { code: "it", label: "Italian" },
  { code: "ja", label: "Japanese" },
  { code: "jv", label: "Javanese" },
  { code: "kn", label: "Kannada" },
  { code: "kk", label: "Kazakh" },
  { code: "km", label: "Khmer" },
  { code: "rw", label: "Kinyarwanda" },
  { code: "ko", label: "Korean" },
  { code: "ku", label: "Kurdish" },
  { code: "ky", label: "Kyrgyz" },
  { code: "lo", label: "Lao" },
  { code: "la", label: "Latin" },
  { code: "lv", label: "Latvian" },
  { code: "lt", label: "Lithuanian" },
  { code: "lb", label: "Luxembourgish" },
  { code: "mk", label: "Macedonian" },
  { code: "mg", label: "Malagasy" },
  { code: "ms", label: "Malay" },
  { code: "ml", label: "Malayalam" },
  { code: "mt", label: "Maltese" },
  { code: "mi", label: "Maori" },
  { code: "mr", label: "Marathi" },
  { code: "mn", label: "Mongolian" },
  { code: "my", label: "Myanmar (Burmese)" },
  { code: "ne", label: "Nepali" },
  { code: "no", label: "Norwegian" },
  { code: "ny", label: "Nyanja (Chichewa)" },
  { code: "or", label: "Odia (Oriya)" },
  { code: "ps", label: "Pashto" },
  { code: "fa", label: "Persian" },
  { code: "pl", label: "Polish" },
  { code: "pt", label: "Portuguese" },
  { code: "pa", label: "Punjabi" },
  { code: "ro", label: "Romanian" },
  { code: "ru", label: "Russian" },
  { code: "sm", label: "Samoan" },
  { code: "gd", label: "Scots Gaelic" },
  { code: "sr", label: "Serbian" },
  { code: "st", label: "Sesotho" },
  { code: "sn", label: "Shona" },
  { code: "sd", label: "Sindhi" },
  { code: "si", label: "Sinhala (Sinhalese)" },
  { code: "sk", label: "Slovak" },
  { code: "sl", label: "Slovenian" },
  { code: "so", label: "Somali" },
  { code: "es", label: "Spanish" },
  { code: "su", label: "Sundanese" },
  { code: "sw", label: "Swahili" },
  { code: "sv", label: "Swedish" },
  { code: "tl", label: "Tagalog (Filipino)" },
  { code: "tg", label: "Tajik" },
  { code: "ta", label: "Tamil" },
  { code: "tt", label: "Tatar" },
  { code: "te", label: "Telugu" },
  { code: "th", label: "Thai" },
  { code: "tr", label: "Turkish" },
  { code: "tk", label: "Turkmen" },
  { code: "uk", label: "Ukrainian" },
  { code: "ur", label: "Urdu" },
  { code: "ug", label: "Uyghur" },
  { code: "uz", label: "Uzbek" },
  { code: "vi", label: "Vietnamese" },
  { code: "cy", label: "Welsh" },
  { code: "xh", label: "Xhosa" },
  { code: "yi", label: "Yiddish" },
  { code: "yo", label: "Yoruba" },
  { code: "zu", label: "Zulu" },
];

const DEFAULTS = {
  enabled: false,
  langFrom: "auto",
  langTo: "en",
  boxColor: "#1a1a2e",
  textColor: "#ffffff",
  opacity: 80,
};

const $ = (id) => document.getElementById(id);

function populateSelect(selectEl, selectedCode, includeAuto) {
  selectEl.innerHTML = "";
  LANGUAGES.forEach(({ code, label }) => {
    if (code === "auto" && !includeAuto) return;
    const opt = document.createElement("option");
    opt.value = code;
    opt.textContent = label;
    if (code === selectedCode) opt.selected = true;
    selectEl.appendChild(opt);
  });
}

function sendSettings(settings) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { type: "UPDATE_SETTINGS", settings });
    }
  });
}

function saveAndSend(partial) {
  chrome.storage.sync.get(DEFAULTS, (stored) => {
    const updated = { ...stored, ...partial };
    chrome.storage.sync.set(updated, () => {
      if (chrome.runtime.lastError) {
        console.error("Babelfish: failed to save settings:", chrome.runtime.lastError.message);
        return;
      }
      sendSettings(updated);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleEl = $("toggle-enabled");
  const langFromEl = $("lang-from");
  const langToEl = $("lang-to");
  const swapBtn = $("swap-langs");
  const boxColorEl = $("box-color");
  const textColorEl = $("text-color");
  const opacityEl = $("opacity");
  const opacityValueEl = $("opacity-value");
  const resetBtn = $("reset-btn");
  const startSttBtn = $("start-stt-btn");
  const stopSttBtn = $("stop-stt-btn");
  let isListening = false;

  // Load stored settings
  chrome.storage.sync.get(DEFAULTS, (settings) => {
    toggleEl.checked = settings.enabled;
    populateSelect(langFromEl, settings.langFrom, true);
    populateSelect(langToEl, settings.langTo, false);
    boxColorEl.value = settings.boxColor;
    textColorEl.value = settings.textColor;
    opacityEl.value = settings.opacity;
    opacityValueEl.textContent = `${settings.opacity}%`;
  });

  // Toggle
  toggleEl.addEventListener("change", () => {
    saveAndSend({ enabled: toggleEl.checked });
  });

  // Language selects
  langFromEl.addEventListener("change", () => {
    saveAndSend({ langFrom: langFromEl.value });
  });

  langToEl.addEventListener("change", () => {
    saveAndSend({ langTo: langToEl.value });
  });

  // Swap languages
  swapBtn.addEventListener("click", () => {
    const fromVal = langFromEl.value === "auto" ? "en" : langFromEl.value;
    const toVal = langToEl.value;
    populateSelect(langFromEl, toVal, true);
    populateSelect(langToEl, fromVal, false);
    saveAndSend({ langFrom: toVal, langTo: fromVal });
  });

  // Box color
  boxColorEl.addEventListener("input", () => {
    saveAndSend({ boxColor: boxColorEl.value });
  });

  // Text color
  textColorEl.addEventListener("input", () => {
    saveAndSend({ textColor: textColorEl.value });
  });

  // Opacity
  opacityEl.addEventListener("input", () => {
    const val = parseInt(opacityEl.value, 10);
    opacityValueEl.textContent = `${val}%`;
    saveAndSend({ opacity: val });
  });

  // Reset
  resetBtn.addEventListener("click", () => {
    chrome.storage.sync.set(DEFAULTS, () => {
      if (chrome.runtime.lastError) {
        console.error("Babelfish: failed to reset settings:", chrome.runtime.lastError.message);
        return;
      }
      toggleEl.checked = DEFAULTS.enabled;
      populateSelect(langFromEl, DEFAULTS.langFrom, true);
      populateSelect(langToEl, DEFAULTS.langTo, false);
      boxColorEl.value = DEFAULTS.boxColor;
      textColorEl.value = DEFAULTS.textColor;
      opacityEl.value = DEFAULTS.opacity;
      opacityValueEl.textContent = `${DEFAULTS.opacity}%`;
      sendSettings(DEFAULTS);
    });
  });

  // STT Controls
  function updateSttButtons() {
    if (isListening) {
      startSttBtn.style.display = "none";
      stopSttBtn.style.display = "block";
    } else {
      startSttBtn.style.display = "block";
      stopSttBtn.style.display = "none";
    }
  }

  startSttBtn.addEventListener("click", async () => {
    isListening = true;
    updateSttButtons();
    
    // Send message to background to start recording
    chrome.runtime.sendMessage({ type: "START_STT" });
    
    // Make sure overlay is enabled
    if (!toggleEl.checked) {
      toggleEl.checked = true;
      saveAndSend({ enabled: true });
    }
  });

  stopSttBtn.addEventListener("click", () => {
    isListening = false;
    updateSttButtons();
    
    // Send message to background to stop recording
    chrome.runtime.sendMessage({ type: "STOP_STT" });
  });
});
