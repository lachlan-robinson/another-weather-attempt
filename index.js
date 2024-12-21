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

function fetchGeneralData() {
    //Retrieve Values
    const cityName = weatherJSON.city.name;
    const countryCode = weatherJSON.city.country;
    const sunriseRaw = weatherJSON.city.sunrise;
    const sunsetRaw = weatherJSON.city.sunset;

    //00:00 String From Date. Sunrise
    // Time
    const sunrise = `${new Date(sunriseRaw * 1000).toLocaleString("en-US", {
        hour: "numeric",
        hour12: false,
    })}:${new Date(sunriseRaw * 1000)
        .toLocaleString("en-US", {
            minute: "2-digit",
        })
        .toString()
        .padStart(2, "0")}`;
    //Sunset
    const sunset = `${new Date(sunsetRaw * 1000).toLocaleString("en-US", {
        hour: "numeric",
        hour12: false,
    })}:${new Date(sunsetRaw * 1000)
        .toLocaleString("en-US", {
            minute: "2-digit",
        })
        .toString()
        .padStart(2, "0")}`;

    //Day Of Week
    const day = new Date(sunriseRaw * 1000).toLocaleString("en-US", {
        weekday: "long",
    });
    //Date
    const date = new Date(sunriseRaw * 1000).toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
    });

    const obj = {
        cityName: cityName,
        countryCode: countryCode,
        day: day,
        date: date,
        sunrise: sunrise,
        sunset: sunset,
    };

    return obj;
}

function fetchWeatherData() {
    const weatherArray = weatherJSON.list;
    const cleanedArray = [];

    for (var i = 0; i < weatherArray.length; i++) {
        // Time
        const time = `${new Date(weatherArray[i].dt * 1000).toLocaleString("en-US", { hour: "numeric", hour12: false })}:${new Date(weatherArray[i].dt * 1000)
            .toLocaleString("en-US", {
                minute: "2-digit",
            })
            .toString()
            .padStart(2, "0")}`;
        //Day Of Week
        const day = new Date(weatherArray[i].dt * 1000).toLocaleString("en-US", {
            weekday: "long",
        });
        //Date
        const date = new Date(weatherArray[i].dt * 1000).toLocaleString("en-US", {
            day: "2-digit",
            month: "short",
        });
        const weatherDesc = weatherArray[i].weather[0].main;
        const temp = `${(weatherArray[i].main.temp - 273.15).toFixed(1)}°C`;
        const humidity = `${weatherArray[i].main.humidity}`;
        const wind = `${weatherArray[i].wind.speed}`;

        const obj = {
            time: time,
            day: day,
            date: date,
            temp: temp,
            humidity: humidity,
            wind: wind,
            weatherDesc: weatherDesc,
        };
        cleanedArray.push(obj);
    }
    //console.log(cleanedArray);
    return cleanedArray;
}

function fetchTags(data) {
    let tags = [];

    for (var i = 0; i < data.length; i++) {
        if (!tags.includes(data[i].date)) {
            console.log(true);
            tags.push(data[i].date);
        }
    }
    //console.log("Tags Return");
    //console.log(tags);
    return tags;
}

// Middleware for additional data generation
function generateData(req, res, next) {
    // Add logic to populate `generalData` if needed
    generalData.general = fetchGeneralData();
    generalData.weatherData = fetchWeatherData();
    generalData.tags = fetchTags(fetchWeatherData());

    console.log("Displaying Cleaned Data:");
    console.log(generalData);
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
