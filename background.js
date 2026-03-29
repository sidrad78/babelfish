chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === 'START_STT') {
    const streamId = await chrome.tabCapture.getMediaStreamId({ targetTabId: sender.tab.id });
    await ensureOffscreenDocument();
    
    chrome.storage.sync.get({ langFrom: 'auto', langTo: 'en' }, (settings) => {
      const lang = settings.langFrom === 'auto' ? 'en-US' : settings.langFrom;
      chrome.runtime.sendMessage({
        type: 'START_RECORDING',
        target: 'offscreen',
        data: streamId,
        lang: lang
      });
    });
    
    // Update UI to show recording status
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'STT_STATUS', 
          recording: true
        });
      }
    });
  } else if (message.type === 'STOP_STT') {
    chrome.runtime.sendMessage({
      type: 'STOP_RECORDING',
      target: 'offscreen'
    });
    
    // Update UI to show stopped status
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'STT_STATUS', 
          recording: false
        });
      }
    });
  } else if (message.type === 'TRANSCRIPTION_RESULT') {
    let processedText = message.text;
    
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'UPDATE_TRANSCRIPTION', 
          text: processedText,
          isFinal: message.isFinal
        });
      }
    });
  } else if (message.type === 'STT_STATUS' && message.target === 'background') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.id) {
        chrome.tabs.sendMessage(tabs[0].id, { 
          type: 'STT_STATUS', 
          recording: message.recording
        });
      }
    });
  }
});

async function ensureOffscreenDocument() {
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT']
  });

  if (existingContexts.length > 0) return;

  await chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['AUDIO_CAPTURE', 'SPEECH_RECOGNITION'],
    justification: 'Capture and transcribe tab audio for live translation.'
  });
}
