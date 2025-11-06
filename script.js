// OpenWeatherMap API Configuration
const API_KEY = 'YOUR_API_KEY_HERE'; // Users need to get their own free API key from openweathermap.org
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

// DOM Elements
const cityInput = document.getElementById('cityInput');
const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const weatherInfo = document.getElementById('weatherInfo');
const errorMessage = document.getElementById('errorMessage');
const loading = document.getElementById('loading');

// Weather Info Elements
const mainWeatherIcon = document.getElementById('mainWeatherIcon');
const temp = document.getElementById('temp');
const weatherDescription = document.getElementById('weatherDescription');
const cityName = document.getElementById('cityName');
const dateTime = document.getElementById('dateTime');
const feelsLike = document.getElementById('feelsLike');
const humidity = document.getElementById('humidity');
const windSpeed = document.getElementById('windSpeed');
const pressure = document.getElementById('pressure');
const visibility = document.getElementById('visibility');
const uvIndex = document.getElementById('uvIndex');
const sunrise = document.getElementById('sunrise');
const sunset = document.getElementById('sunset');
const forecast = document.getElementById('forecast');

// Event Listeners
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        getWeatherByCity(city);
    } else {
        showError('Please enter a city name');
    }
});

cityInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        const city = cityInput.value.trim();
        if (city) {
            getWeatherByCity(city);
        }
    }
});

locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        loading.style.display = 'block';
        navigator.geolocation.getCurrentPosition(
            position => {
                getWeatherByCoords(position.coords.latitude, position.coords.longitude);
            },
            error => {
                loading.style.display = 'none';
                showError('Unable to get your location. Please enter city manually.');
            }
        );
    } else {
        showError('Geolocation is not supported by your browser');
    }
});

// Fetch Weather by City Name
async function getWeatherByCity(city) {
    try {
        showLoading();
        hideError();

        // Check if API key is set
        if (API_KEY === 'YOUR_API_KEY_HERE') {
            showError('Please add your OpenWeatherMap API key in script.js file. Get free API key from openweathermap.org');
            hideLoading();
            return;
        }

        const response = await fetch(
            `${BASE_URL}/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('City not found');
        }

        const data = await response.json();
        displayWeather(data);
        getForecast(data.coord.lat, data.coord.lon);
    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to fetch weather data');
    }
}

// Fetch Weather by Coordinates
async function getWeatherByCoords(lat, lon) {
    try {
        showLoading();
        hideError();

        if (API_KEY === 'YOUR_API_KEY_HERE') {
            showError('Please add your OpenWeatherMap API key in script.js file');
            hideLoading();
            return;
        }

        const response = await fetch(
            `${BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Location not found');
        }

        const data = await response.json();
        displayWeather(data);
        getForecast(lat, lon);
    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to fetch weather data');
    }
}

// Get 5-Day Forecast
async function getForecast(lat, lon) {
    try {
        const response = await fetch(
            `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        if (!response.ok) {
            throw new Error('Forecast not available');
        }

        const data = await response.json();
        displayForecast(data);
    } catch (error) {
        console.error('Forecast error:', error);
    }
}

// Display Weather Data
function displayWeather(data) {
    // Update main weather info
    temp.textContent = `${Math.round(data.main.temp)}°C`;
    weatherDescription.textContent = data.weather[0].description;
    cityName.textContent = `${data.name}, ${data.sys.country}`;
    dateTime.textContent = formatDate(new Date());

    // Update weather icon
    const iconCode = data.weather[0].icon;
    mainWeatherIcon.className = getWeatherIconClass(data.weather[0].main);

    // Update details
    feelsLike.textContent = `${Math.round(data.main.feels_like)}°C`;
    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
    pressure.textContent = `${data.main.pressure} hPa`;
    visibility.textContent = `${(data.visibility / 1000).toFixed(1)} km`;
    uvIndex.textContent = 'N/A'; // Free API doesn't provide UV index

    // Update sunrise/sunset
    sunrise.textContent = formatTime(new Date(data.sys.sunrise * 1000));
    sunset.textContent = formatTime(new Date(data.sys.sunset * 1000));

    hideLoading();
    weatherInfo.style.display = 'block';
}

// Display 5-Day Forecast
function displayForecast(data) {
    forecast.innerHTML = '';
    
    // Get one forecast per day (around noon)
    const dailyForecasts = data.list.filter(item => 
        item.dt_txt.includes('12:00:00')
    );

    dailyForecasts.slice(0, 5).forEach(day => {
        const date = new Date(day.dt * 1000);
        const card = document.createElement('div');
        card.className = 'forecast-card';
        
        card.innerHTML = `
            <div class="day">${formatDay(date)}</div>
            <i class="${getWeatherIconClass(day.weather[0].main)}"></i>
            <div class="temp">${Math.round(day.main.temp)}°C</div>
            <div class="description">${day.weather[0].description}</div>
        `;
        
        forecast.appendChild(card);
    });
}

// Get Weather Icon Class
function getWeatherIconClass(weatherMain) {
    const iconMap = {
        'Clear': 'fas fa-sun',
        'Clouds': 'fas fa-cloud',
        'Rain': 'fas fa-cloud-rain',
        'Drizzle': 'fas fa-cloud-rain',
        'Thunderstorm': 'fas fa-bolt',
        'Snow': 'fas fa-snowflake',
        'Mist': 'fas fa-smog',
        'Smoke': 'fas fa-smog',
        'Haze': 'fas fa-smog',
        'Dust': 'fas fa-smog',
        'Fog': 'fas fa-smog',
        'Sand': 'fas fa-smog',
        'Ash': 'fas fa-smog',
        'Squall': 'fas fa-wind',
        'Tornado': 'fas fa-tornado'
    };
    
    return iconMap[weatherMain] || 'fas fa-cloud';
}

// Format Date
function formatDate(date) {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-US', options);
}

// Format Day
function formatDay(date) {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Format Time
function formatTime(date) {
    return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
}

// Show/Hide Functions
function showLoading() {
    loading.style.display = 'block';
    weatherInfo.style.display = 'none';
    errorMessage.style.display = 'none';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    weatherInfo.style.display = 'none';
}

function hideError() {
    errorMessage.style.display = 'none';
}

// Load default city on page load (optional)
window.addEventListener('load', () => {
    // Uncomment below to load a default city
    // getWeatherByCity('London');
});
