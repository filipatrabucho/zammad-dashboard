// Toca um pequeno "carrilhão" de notificação sintetizado via Web Audio API —
// evita depender de um ficheiro de áudio externo. Nota: a maioria dos
// browsers só permite áudio automático depois de alguma interação do
// utilizador na página (ex: o clique em "Login com Microsoft" já conta).
export function playChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const notes = [523.25, 659.25, 783.99]; // Dó, Mi, Sol
    notes.forEach((freq, i) => {
      const start = ctx.currentTime + i * 0.16;
      const duration = 0.5;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.18, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + duration + 0.05);
    });

    setTimeout(() => ctx.close(), (notes.length * 0.16 + 0.6) * 1000);
  } catch (err) {
    console.warn('[chime] não foi possível tocar o som de notificação:', err.message);
  }
}

// Som curto e distinto (um único "ping" a subir), para não confundir com o
// carrilhão de 3 notas da pausa para café.
export function playNewTicketChime() {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const start = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, start); // Lá5
    osc.frequency.exponentialRampToValueAtTime(1318.51, start + 0.1); // Mi6

    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(0.16, start + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);

    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + 0.4);

    setTimeout(() => ctx.close(), 500);
  } catch (err) {
    console.warn('[chime] não foi possível tocar o som de novo ticket:', err.message);
  }
}
