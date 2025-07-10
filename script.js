// script.js
const cityInput = document.getElementById('city-input');
const searchBtn = document.getElementById('search-btn');
const cityNameEl = document.getElementById('city-name');
const tempEl = document.getElementById('temp');
const descEl = document.getElementById('desc');
const adviceEl = document.getElementById('advice');
const windEl = document.getElementById('wind');
const humidityEl = document.getElementById('humidity');
const cloudsEl = document.getElementById('clouds');
const weatherIcon = document.getElementById('weather-icon');
const dailyContainer = document.getElementById('daily');
const heatmapFrame = document.getElementById('heatmap');

let globalData = null;

function getAdvice(temp) {
  if (temp >= 30) return '☀️ Muito calor! Use protetor solar e beba muita água.';
  if (temp >= 20) return '🌤️ Tempo agradável. Aproveite o dia!';
  if (temp >= 10) return '🧥 Leve um agasalho se sair de casa.';
  return '❄️ Está frio! Vista-se bem e se mantenha aquecido.';
}

function updateMap(lat, lon) {
  const windyUrl = `https://embed.windy.com/embed2.html?lat=${lat}&lon=${lon}&width=650&height=450&zoom=5&level=surface&overlay=temperature&menu=true&message=true&marker=true&calendar=now&pressure=true&type=map&location=coordinates&detail=false&metricWind=default&metricTemp=default&radarRange=-1`;
  heatmapFrame.src = windyUrl;
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

async function fetchWeather(lat, lon, name) {
  try {
    const api = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,cloudcover,wind_speed_10m,relative_humidity_2m,weathercode&hourly=temperature_2m,weathercode,wind_speed_10m,cloudcover,relative_humidity_2m&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`;
    const res = await fetch(api);
    const data = await res.json();
    globalData = data;

    const temp = data.current.temperature_2m;
    tempEl.textContent = `${temp}°C`;
    descEl.textContent = 'Tempo atual';
    adviceEl.textContent = getAdvice(temp);
    windEl.textContent = `${data.current.wind_speed_10m} km/h`;
    humidityEl.textContent = `${data.current.relative_humidity_2m}%`;
    cloudsEl.textContent = `${data.current.cloudcover}%`;
    weatherIcon.src = `https://img.icons8.com/fluency/96/partly-cloudy-day.png`;

    cityNameEl.textContent = name;
    updateMap(lat, lon);

    dailyContainer.innerHTML = '';
    for (let i = 0; i < 7; i++) {
      const card = document.createElement('div');
      card.className = 'day';
      card.innerHTML = `
        <h4>${formatDate(data.daily.time[i])}</h4>
        <img src="https://img.icons8.com/ios/50/temperature--v1.png" alt="temp">
        <p>${data.daily.temperature_2m_min[i]}°C / ${data.daily.temperature_2m_max[i]}°C</p>
      `;
      dailyContainer.appendChild(card);
    }
  } catch (err) {
    alert('Erro ao carregar dados do clima.');
    console.error(err);
  }
}

async function getCoordsFromCity(city) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=pt&format=json`;
  const res = await fetch(url);
  const data = await res.json();
  if (data.results && data.results.length > 0) {
    const { latitude, longitude, name } = data.results[0];
    fetchWeather(latitude, longitude, name);
  } else {
    alert('Cidade não encontrada.');
  }
}

searchBtn.addEventListener('click', () => {
  const city = cityInput.value.trim();
  if (city) getCoordsFromCity(city);
});

window.addEventListener('load', () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        fetchWeather(lat, lon, 'Sua Localização');
      },
      () => {
        getCoordsFromCity('São Paulo');
      }
    );
  } else {
    getCoordsFromCity('São Paulo');
  }
});
