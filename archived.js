import express from "express";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
    const path = "res.json";

    fs.readFile(path, "utf8", (err, data) => {
        if (err) {
            console.error("Error while reading the file:", err);
            res.status(500).send("Error while reading the file.");
            return;
        }
        try {
            const jsonData = JSON.parse(data);

            // Generate HTML content
            let htmlContent = `
                <html>
                <head>
                    <title>Weather Information</title>
                </head>
                <body>
                    <h1>Weather Information</h1>
            `;

            const cityName = `${jsonData["city"]["name"]}, ${jsonData["city"]["country"]}`;
            const sunriseUnix = jsonData["city"]["sunrise"];
            const sunrise = new Date(sunriseUnix * 1000).toLocaleString(
                "en-US",
                {
                    hour: "2-digit",
                    minute: "2-digit",
                }
            );

            const sunsetUnix = jsonData["city"]["sunset"];
            const sunset = new Date(sunsetUnix * 1000).toLocaleString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
            });

            htmlContent += `
                <h2>${cityName}</h2>
                <h3>Sunrise:</h3>
                <p>${sunrise}</p>
                <h3>Sunset:</h3>
                <p>${sunset}</p>
                <div class="weather-container">
            `;

            for (let i = 0; i < jsonData["list"].length; i++) {
                const dateUnix = jsonData["list"][i]["dt"];
                const date = new Date(dateUnix * 1000).toLocaleString("en-US", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                });

                let temp = jsonData["list"][i]["main"]["temp"];
                temp -= 273.15;

                let weather = jsonData["list"][i]["weather"][0]["main"];

                htmlContent += `
                <div class="weather-card">
                    <h3>${date}</h3>
                    <p>${temp.toFixed(0)}°C</p>
                    <p>${weather}</p>
                </div>
                `;
            }

            htmlContent += `
                </div>
                </body>
                </html>
            `;

            res.send(htmlContent);
        } catch (parseErr) {
            console.error("Error while parsing JSON data:", parseErr);
            res.status(500).send("Error while parsing JSON data.");
        }
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
