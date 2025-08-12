const weatherKey = "2440e6d9d7ed6c45aad75db840175ee5";
const unsplashKey = "zAdTEocSip839dDkyd_lRg5KUYx_Rxn_E0Gh6fRshPo";

const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const weatherInfo = document.getElementById("weatherInfo");
const cityName = document.getElementById("cityName");
const localTime = document.getElementById("localTime");
const weatherDesc = document.getElementById("weatherDesc");
const temperature = document.getElementById("temperature");
const weatherIcon = document.getElementById("weatherIcon");
const forecast = document.getElementById("forecast");
const searchList = document.getElementById("searchList");
const loader = document.getElementById("loader");

let recentCities = JSON.parse(localStorage.getItem("recentCities")) || [];

// Loader controls
function showLoader() { loader.classList.remove("hidden"); }
function hideLoader() { loader.classList.add("hidden"); }

searchBtn.addEventListener("click", () => {
    const city = cityInput.value.trim();
    if (city) fetchWeather(city);
});

// Fetch Weather Data
function fetchWeather(city) {
    showLoader();
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
        hideLoader();
        if (data.cod !== 200) {
            alert("City not found!");
            return;
        }
        cityName.textContent = `${data.name}, ${data.sys.country}`;
        weatherDesc.textContent = data.weather[0].description;
        temperature.textContent = `${Math.round(data.main.temp)}°C`;
        weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
        
        const timezoneOffset = data.timezone / 3600;
        localTime.textContent = `Local Time: UTC${timezoneOffset >= 0 ? "+" : ""}${timezoneOffset}`;
        
        saveRecentCity(city);
        fetchCityImage(city);
        fetchForecast(city);
        
        weatherInfo.classList.remove("hidden");
        setTimeout(() => weatherInfo.classList.remove("opacity-0"), 50);
    })
    .catch(() => {
        hideLoader();
        alert("Error fetching data!");
    });
}

// Fetch City Image
function fetchCityImage(city) {
    fetch(`https://api.unsplash.com/search/photos?query=${city}&client_id=${unsplashKey}`)
    .then(res => res.json())
    .then(data => {
        if (data.results.length > 0) {
            document.body.style.backgroundImage = `url(${data.results[0].urls.full})`;
        }
    });
}

// Fetch Forecast
function fetchForecast(city) {
    fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${weatherKey}&units=metric`)
    .then(res => res.json())
    .then(data => {
        forecast.innerHTML = "";
        forecast.className = "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mt-6"; // Responsive grid
        data.list.filter((_, i) => i % 8 === 0).forEach(day => {
            const date = new Date(day.dt * 1000);
            forecast.innerHTML += `
                <div class="bg-white/10 backdrop-blur-md p-4 rounded-xl text-center shadow-2xl transform transition duration-300 hover:scale-105 hover:bg-white/20">
                    <p class="font-semibold">${date.toDateString().split(" ")[0]}</p>
                    <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" class="mx-auto w-16 h-16" />
                    <p class="text-lg font-bold">${Math.round(day.main.temp)}°C</p>
                </div>
            `;
        });
    });
}


// Save recent cities
function saveRecentCity(city) {
    if (!recentCities.includes(city)) {
        recentCities.unshift(city);
        if (recentCities.length > 5) recentCities.pop();
        localStorage.setItem("recentCities", JSON.stringify(recentCities));
        renderRecentSearches();
    }
}

// Render recent searches
function renderRecentSearches() {
    searchList.innerHTML = "";
    recentCities.forEach(c => {
        const btn = document.createElement("button");
        btn.textContent = c;
        btn.className = "bg-gray-700 px-3 py-1 rounded hover:bg-gray-600";
        btn.addEventListener("click", () => fetchWeather(c));
        searchList.appendChild(btn);
    });
}

// Theme toggle
document.getElementById("themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("bg-gray-100");
    document.body.classList.toggle("text-black");
    document.body.classList.toggle("bg-gray-900");
    document.body.classList.toggle("text-white");
});

renderRecentSearches();