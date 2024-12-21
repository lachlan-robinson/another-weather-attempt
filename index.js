import express from "express";
import bodyParser from "body-parser";
import fs from "fs/promises";

const app = express();
const port = 3000;
let weatherJSON = {};
let generalData = {};

// Middleware to read data file
async function readDataFile(req, res, next) {
    try {
        const data = await fs.readFile("res.json", "utf8");
        weatherJSON = JSON.parse(data);
        next();
    } catch (err) {
        console.error("Error reading or parsing file:", err);
        res.status(500).send("Error loading weather data.");
    }
}

// Load data once during server startup
(async () => {
    try {
        const data = await fs.readFile("res.json", "utf8");
        weatherJSON = JSON.parse(data);
        console.log("Weather data loaded successfully.");
    } catch (err) {
        console.error("Failed to load initial weather data:", err);
    }
})();

function formatTime(timestamp) {
    const date = new Date(timestamp * 1000);
    const hours = date.toLocaleString("en-US", { hour: "numeric", hour12: false });
    const minutes = date.toLocaleString("en-US", { minute: "2-digit" }).padStart(2, "0");
    return `${hours}:${minutes}`;
}

function formatDate(timestamp, options) {
    return new Date(timestamp * 1000).toLocaleString("en-US", options);
}

function fetchGeneralData() {
    const { name: cityName, country: countryCode, sunrise: sunriseRaw, sunset: sunsetRaw } = weatherJSON.city;
    return {
        cityName,
        countryCode,
        day: formatDate(sunriseRaw, { weekday: "long" }),
        date: formatDate(sunriseRaw, { day: "2-digit", month: "short" }),
        sunrise: formatTime(sunriseRaw),
        sunset: formatTime(sunsetRaw),
    };
}

function fetchWeatherData() {
    return weatherJSON.list.map((item) => ({
        time: formatTime(item.dt),
        day: formatDate(item.dt, { weekday: "long" }),
        date: formatDate(item.dt, { day: "2-digit", month: "short" }),
        temp: `${(item.main.temp - 273.15).toFixed(1)}°C`,
        humidity: `${item.main.humidity}`,
        wind: `${item.wind.speed}`,
        weatherDesc: item.weather[0].main,
    }));
}

function fetchTags(data) {
    return [...new Set(data.map((item) => item.date))];
}

// Middleware for additional data generation
function generateData(req, res, next) {
    generalData = {
        general: fetchGeneralData(),
        weatherData: fetchWeatherData(),
        tags: fetchTags(fetchWeatherData()),
    };
    console.log("Displaying Cleaned Data:", generalData);
    next();
}

// Middleware configuration
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(generateData);

// Route to render the main page
app.get("/", (req, res) => {
    res.render("index.ejs", { weather: generalData });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
