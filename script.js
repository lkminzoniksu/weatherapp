document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("weather-form");
  const input = document.getElementById("city-input");
  const cityEl = document.querySelector(".city");
  const tempEl = document.querySelector(".temperature");
  const conditionEl = document.querySelector(".condition");
  const detailsEl = document.querySelector(".details");
  const unitToggle = document.getElementById("unit-toggle");

  const WEATHER_API_KEY = "mFx/A2WBDymhRdOuNF9rAQ==8wb4NNubPzJWEHOM";
  const UNSPLASH_KEY = "ts_Ja-efbbRLIIwIlucYbiHDELoAbZZZhyFxqevor_c";

  let isMetric = true;
  let currentWeatherData = null;
  let currentCity = "";
  let currentBackgroundUrl = "";

  const weatherCategories = {
    Clear: "sunny,blue sky",
    Clouds: "cloudy,sky",
    Rain: "rain,storm",
    Snow: "snow,winter",
    Mist: "fog,mist"
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const city = input.value.trim();
    if (city) fetchWeather(city);
  });

  unitToggle.addEventListener("click", () => {
    isMetric = !isMetric;
    if (currentWeatherData) renderWeather(currentCity, currentWeatherData, false);
    unitToggle.textContent = isMetric ? "Switch to °F / mph" : "Switch to °C / m/s";
  });

  async function fetchWeather(city) {
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}`;
      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();
      if (!geoData.length) {
        alert("City not found. Try again.");
        return;
      }

      const lat = geoData[0].lat;
      const lon = geoData[0].lon;

      const weatherUrl = `https://api.api-ninjas.com/v1/weather?lat=${lat}&lon=${lon}`;
      const res = await fetch(weatherUrl, {
        headers: { "X-Api-Key": WEATHER_API_KEY }
      });

      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      renderWeather(city, data);
    } catch (err) {
      console.error("Error fetching weather:", err);
      alert("Error fetching weather. Try again.");
    }
  }

  function getWeatherCategory(data) {
    if (data.temp <= 0 && data.cloud_pct > 30) return "Snow";
    if (data.cloud_pct < 20 && data.wind_speed < 5) return "Clear";
    if (data.cloud_pct >= 20 && data.cloud_pct <= 60) return "Clouds";
    if (data.cloud_pct > 60 || data.humidity > 80) return "Rain";
    return "Mist";
  }

  async function setBackground(weatherMain) {
    const query = weatherCategories[weatherMain] || "weather";
    const url = `https://api.unsplash.com/photos/random?query=${encodeURIComponent(query)}&orientation=landscape&client_id=${UNSPLASH_KEY}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      const imageUrl = data.urls.full || data.urls.regular;
      currentBackgroundUrl = `url('${imageUrl}')`;
      document.body.style.backgroundImage = currentBackgroundUrl;
    } catch (err) {
      console.error("Error fetching background image:", err);
    }
  }

  function renderWeather(city, data, updateBackground = true) {
    currentWeatherData = data;
    currentCity = city;

    const temp = isMetric ? data.temp : (data.temp * 9/5 + 32).toFixed(1);
    const feels = isMetric ? data.feels_like : (data.feels_like * 9/5 + 32).toFixed(1);
    const min = isMetric ? data.min_temp : (data.min_temp * 9/5 + 32).toFixed(1);
    const max = isMetric ? data.max_temp : (data.max_temp * 9/5 + 32).toFixed(1);
    const wind = isMetric ? data.wind_speed : (data.wind_speed * 2.237).toFixed(1);

    cityEl.textContent = city;
    tempEl.textContent = `${temp}${isMetric ? "°C" : "°F"}`;
    conditionEl.textContent = `Humidity: ${data.humidity}%, Wind: ${wind} ${isMetric ? "m/s" : "mph"}`;

    detailsEl.style.display = "block";
    detailsEl.innerHTML = `
      <p>Feels like: ${feels}${isMetric ? "°C" : "°F"}</p>
      <p>Min temp: ${min}${isMetric ? "°C" : "°F"}, Max temp: ${max}${isMetric ? "°C" : "°F"}</p>
      <p>Cloud cover: ${data.cloud_pct}%</p>
      <p>Wind direction: ${data.wind_degrees}°</p>
      <p>Sunrise: ${new Date(data.sunrise * 1000).toLocaleTimeString()}</p>
      <p>Sunset: ${new Date(data.sunset * 1000).toLocaleTimeString()}</p>
    `;

    if (updateBackground) {
      const weatherMain = getWeatherCategory(data);
      setBackground(weatherMain);
    } else {
      document.body.style.backgroundImage = currentBackgroundUrl;
    }
  }
});
