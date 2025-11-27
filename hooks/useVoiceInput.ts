import { useState, useCallback, useEffect } from 'react';
import { VOICE_REPLACEMENTS } from '../constants';

export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = false;
        reco.lang = 'es-ES';
        setRecognition(reco);
      }
    }
  }, []);

  const startListening = useCallback((onResult: (text: string) => void) => {
    if (!recognition) {
      alert('Tu navegador no soporta entrada de voz.');
      return;
    }

    setIsListening(true);
    
    recognition.onresult = (event: any) => {
      let text = event.results[0][0].transcript;
      
      // Apply replacements (case insensitive)
      Object.entries(VOICE_REPLACEMENTS).forEach(([key, value]) => {
        const regex = new RegExp(key, 'gi');
        text = text.replace(regex, value);
      });

      setTranscript(text);
      onResult(text);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, [recognition]);

  const stopListening = useCallback(() => {
    if (recognition) {
      recognition.stop();
      setIsListening(false);
    }
  }, [recognition]);

  return { isListening, startListening, stopListening, transcript };
};