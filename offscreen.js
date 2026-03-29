let recognition;
let audioContext;
let mediaStream;

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
    mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        mandatory: {
          chromeMediaSource: 'tab',
          chromeMediaSourceId: streamId
        }
      },
      video: false
    });

    audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(audioContext.destination);

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.error('Speech Recognition not supported in this browser.');
      stopRecording();
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
      chrome.runtime.sendMessage({
        type: 'STT_STATUS',
        target: 'background',
        recording: false,
        error: event.error
      });
    };

    recognition.onend = () => {
      console.log('Speech recognition ended.');
      chrome.runtime.sendMessage({
        type: 'STT_STATUS',
        target: 'background',
        recording: false
      });
    };

    recognition.start();
  } catch (error) {
    console.error('Error starting audio capture:', error);
    stopRecording();
  }
}

function stopRecording() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
  
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => track.stop());
    mediaStream = null;
  }
  
  if (audioContext && audioContext.state !== 'closed') {
    audioContext.close();
    audioContext = null;
  }
}
