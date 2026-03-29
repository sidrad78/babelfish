chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'START_STT') {
    (async () => {
      try {
        if (!sender.tab?.id) {
          console.error('No tab context available');
          return;
        }
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
        
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, { 
              type: 'STT_STATUS', 
              recording: true
            });
          }
        });
      } catch (err) {
        console.error('START_STT error:', err);
      }
    })();
    return true;
  } else if (message.type === 'STOP_STT') {
    chrome.runtime.sendMessage({
      type: 'STOP_RECORDING',
      target: 'offscreen'
    });
    
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
