let recognition;

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.target !== 'offscreen') return;

  if (message.type === 'START_RECORDING') {
    startRecording(message.data, message.lang);
  } else if (message.type === 'STOP_RECORDING') {
    stopRecording();
  }
});

async function startRecording(streamId, lang = 'en-US') {
  if (recognition) return;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      },
      video: false
    });

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(audioContext.destination);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser.');
      return;
    }

    recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      if (finalTranscript || interimTranscript) {
        chrome.runtime.sendMessage({
          type: 'TRANSCRIPTION_RESULT',
          text: finalTranscript || interimTranscript,
          isFinal: !!finalTranscript
        });
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended.');
      // Notify background that recording stopped
      chrome.runtime.sendMessage({
        type: 'STT_STATUS',
        target: 'background',
        recording: false
      });
    };

    recognition.start();
  } catch (error) {
    console.error('Error starting audio capture:', error);
  }
}

function stopRecording() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  // Optionally close the offscreen document
  // window.close(); // Not recommended to close itself usually
}
