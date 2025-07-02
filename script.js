const apiKey = '922e6b25270e6acdb773569632699500';

document.getElementById('input-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = document.getElementById('city-input');
  const city = input.value.trim();
  if (!city) return;
  addUserMessage(city);
  fetchWeather(city);
  updateHistory(city);
  input.value = '';
});

function addUserMessage(text) {
  const chat = document.getElementById('chat-box');
  const div = document.createElement('div');
  div.className = 'user-message';
  div.textContent = `Você: Como está o tempo em ${text}?`;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

function addBotMessage(text) {
  const chat = document.getElementById('chat-box');
  const div = document.createElement('div');
  div.className = 'bot-message';
  div.textContent = text;
  chat.appendChild(div);
  chat.scrollTop = chat.scrollHeight;
}

async function fetchWeather(city) {
  addBotMessage(`⏳ Consultando o tempo em ${city}...`);
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&lang=pt_br&appid=${apiKey}`);
    if (!res.ok) throw new Error('Cidade não encontrada.');
    const data = await res.json();
    const weather = data.weather[0].description;
    const temp = data.main.temp;
    const emoji = getWeatherEmoji(weather);
    addBotMessage(`📍 Em ${data.name} está ${weather}, com ${temp}°C ${emoji}`);
  } catch (err) {
    addBotMessage('❌ ' + err.message);
  }
}

function getWeatherEmoji(description) {
  const d = description.toLowerCase();
  if (d.includes('nuvens')) return '☁️';
  if (d.includes('sol') || d.includes('céu limpo')) return '☀️';
  if (d.includes('chuva')) return '🌧️';
  if (d.includes('neve')) return '❄️';
  return '🌡️';
}

function updateHistory(city) {
  const history = document.getElementById('history');
  const item = document.createElement('div');
  item.className = 'history-item';
  item.textContent = city;
  item.onclick = () => {
    addUserMessage(city);
    fetchWeather(city);
  };
  history.prepend(item);
}
