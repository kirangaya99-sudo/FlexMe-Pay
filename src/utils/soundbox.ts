// Utility to play Cashfree Soundbox audio alert on successful payment collection

export function playCashfreeSoundbox(amount: number, language: 'en' | 'hi' = 'en'): void {
  try {
    // 1. Play digital audio chime via Web Audio API
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      const ctx = new AudioContextClass();
      
      const playTone = (freq: number, start: number, duration: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + start);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + start);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + duration);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + start);
        osc.stop(ctx.currentTime + start + duration);
      };

      // Upbeat 3-note Cashfree signature soundbox chime
      playTone(523.25, 0.0, 0.15); // C5
      playTone(659.25, 0.15, 0.15); // E5
      playTone(783.99, 0.3, 0.35); // G5
    }

    // 2. Play vocal confirmation via Web Speech Synthesis API
    if ('speechSynthesis' in window) {
      setTimeout(() => {
        const text = language === 'hi' 
          ? `कैशफ्री पेमेंट्स पर ${amount} रुपये प्राप्त हुए` 
          : `Cashfree Payments: Received rupees ${amount} successfully`;
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.05;
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
        
        // Pick an Indian English or Hindi voice if available
        const voices = window.speechSynthesis.getVoices();
        const indianVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('hi'));
        if (indianVoice) {
          utterance.voice = indianVoice;
        }

        window.speechSynthesis.speak(utterance);
      }, 500);
    }
  } catch (err) {
    console.warn('Soundbox audio could not be played:', err);
  }
}

export function generatePlayStoreRedeemCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  const getChunk = () => Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `GPLY-${getChunk()}-${getChunk()}-${getChunk()}`;
}

export function generateCashfreeOrderId(): string {
  const time = Date.now().toString().slice(-6);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `CF_PW_${time}_${rand}`;
}
