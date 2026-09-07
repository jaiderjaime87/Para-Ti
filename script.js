const screens = {
  unlock: document.getElementById('unlockScreen'),
  home: document.getElementById('homeScreen'),
  memories: document.getElementById('memoriesScreen'),
  letter: document.getElementById('letterScreen')
};

const startDate = new Date(2024, 8, 22);
let currentScreen = 'unlock';
let musicOn = false;
let audioContext;
let musicTimer;
let musicGain;

const melody = [
  [261.63, 0], [329.63, .45], [392, .9], [329.63, 1.35],
  [293.66, 1.8], [349.23, 2.25], [440, 2.7], [349.23, 3.15],
  [261.63, 3.6], [329.63, 4.05], [392, 4.5], [523.25, 4.95],
  [440, 5.4], [392, 5.85], [329.63, 6.3], [261.63, 6.75]
];

function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => screen.classList.toggle('is-active', key === name));
  currentScreen = name;
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updateCounter() {
  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
  let days = now.getDate() - startDate.getDate();
  if (days < 0) { months -= 1; const previousMonth = new Date(now.getFullYear(), now.getMonth(), 0).getDate(); days += previousMonth; }
  if (months < 0) { years -= 1; months += 12; }
  const elapsed = now - new Date(now.getFullYear(), now.getMonth(), now.getDate());
  document.getElementById('years').textContent = years;
  document.getElementById('months').textContent = months;
  document.getElementById('days').textContent = days;
  document.getElementById('hours').textContent = Math.floor(elapsed / 3600000);
  document.getElementById('minutes').textContent = Math.floor(elapsed / 60000) % 60;
  document.getElementById('seconds').textContent = Math.floor(elapsed / 1000) % 60;
}

function unlock() {
  const day = Number(document.getElementById('dayInput').value);
  const month = Number(document.getElementById('monthInput').value);
  const year = Number(document.getElementById('yearInput').value);
  const error = document.getElementById('errorMessage');
  if (day === 22 && month === 9 && year === 2024) {
    error.textContent = '';
    updateCounter();
    showScreen('home');
  } else {
    error.textContent = 'Esa no es la fecha secreta. Prueba con 22 / 09 / 2024';
  }
}

function playNote(frequency, delay) {
  const oscillator = audioContext.createOscillator();
  const noteGain = audioContext.createGain();
  const start = audioContext.currentTime + delay;
  oscillator.type = 'sine';
  oscillator.frequency.value = frequency;
  noteGain.gain.setValueAtTime(0.001, start);
  noteGain.gain.exponentialRampToValueAtTime(0.075, start + 0.08);
  noteGain.gain.exponentialRampToValueAtTime(0.001, start + 1.1);
  oscillator.connect(noteGain).connect(musicGain);
  oscillator.start(start);
  oscillator.stop(start + 1.15);
}

function startMusic() {
  audioContext = audioContext || new AudioContext();
  musicGain = audioContext.createGain();
  musicGain.gain.value = 0.45;
  musicGain.connect(audioContext.destination);
  if (audioContext.state === 'suspended') audioContext.resume();
  const loop = () => melody.forEach(([frequency, delay]) => playNote(frequency, delay));
  loop();
  musicTimer = window.setInterval(loop, 7200);
}

function stopMusic() {
  window.clearInterval(musicTimer);
  if (musicGain) musicGain.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.25);
}

async function tryStartMusic() {
  try {
    if (!audioContext) startMusic();
    if (audioContext.state === 'suspended') await audioContext.resume();
    musicOn = true;
    document.getElementById('musicButton').textContent = '\u23f8';
  } catch (error) {
    // Algunos navegadores exigen una primera interacción para permitir audio.
  }
}

document.getElementById('unlockButton').addEventListener('click', unlock);
document.getElementById('dayInput').addEventListener('keydown', (event) => { if (event.key === 'Enter') unlock(); });
document.getElementById('memoriesButton').addEventListener('click', () => showScreen('memories'));
document.getElementById('letterButton').addEventListener('click', () => showScreen('letter'));
document.querySelectorAll('[data-back]').forEach((button) => button.addEventListener('click', () => showScreen('home')));
document.getElementById('backButton').addEventListener('click', () => showScreen(currentScreen === 'unlock' ? 'unlock' : 'home'));
document.getElementById('musicButton').addEventListener('click', () => {
  musicOn = !musicOn;
  if (musicOn) startMusic();
  else stopMusic();
  document.getElementById('musicButton').textContent = musicOn ? '\u23f8' : '\u266b';
  showToast(musicOn ? 'Nuestra canción está sonando' : 'Música pausada');
});
window.addEventListener('pointerdown', tryStartMusic, { once: true });

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(showToast.timeout);
  showToast.timeout = window.setTimeout(() => toast.classList.remove('show'), 2300);
}

updateCounter();
window.setInterval(updateCounter, 1000);
tryStartMusic();