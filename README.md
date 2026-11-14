# Skycast: Global Weather & Air Quality

A React + Vite dashboard with live weather, a 12-hour and 7-day forecast, 30-day weather history and air quality (US and European AQI). It needs no API key, so it runs locally and deploys to Vercel as-is.

## Features
- Detects your location automatically and falls back to a city search if you decline.
- Search any city worldwide, with keyboard navigation.
- Temperature, feels-like, humidity, wind speed and direction, visibility, pressure, cloud cover, UV index, rain.
- °C / °F switch (also switches km/h to mph, km to mi, mm to in, hPa to inHg). Your choice and last city are remembered.
- 12-hour forecast chart and strip, 7-day forecast, past 30 days of highs, lows and rainfall with summary stats.
- Air quality: US AQI, European AQI, PM2.5, PM10, ozone, nitrogen dioxide, a colour scale, a 5-day trend chart (3 days back, 2 ahead) and plain-language explanations of every level.
- Atmospheric backgrounds (sun, moon and stars, clouds, rain, snow, thunderstorm flashes, fog) switch automatically with the current conditions and day or night. They are drawn with CSS, so there are no image files to host.
- Loading skeletons, error screen with retry, friendly messages for blocked location.
- Charts are hand-built SVG, so the only runtime dependencies are React and React DOM.

## APIs used (all free, no key)
| Purpose | API | Docs |
|---|---|---|
| Forecast and current weather | `api.open-meteo.com/v1/forecast` | https://open-meteo.com/en/docs |
| City search | `geocoding-api.open-meteo.com/v1/search` | https://open-meteo.com/en/docs/geocoding-api |
| Air quality (US AQI, EAQI, pollutants) | `air-quality-api.open-meteo.com/v1/air-quality` | https://open-meteo.com/en/docs/air-quality-api |
| Weather history | `archive-api.open-meteo.com/v1/archive` | https://open-meteo.com/en/docs/historical-weather-api |
| Place name for your coordinates | `api.bigdatacloud.net/data/reverse-geocode-client` | https://www.bigdatacloud.com/free-api/free-reverse-geocode-to-city-api |

Open-Meteo’s free tier is for non-commercial use and requires attribution (included in the footer). For commercial use, get a commercial plan from Open-Meteo.

## Run locally
1. Install Node.js 18 or newer from https://nodejs.org (check with `node -v`).
2. Unzip the project and open a terminal in the folder.
3. Install dependencies: `npm install`
4. Start the dev server: `npm run dev`
5. Open the URL it prints (usually http://localhost:5173) and allow location access when asked.

Other commands: `npm run build` creates the production build in `dist/`, and `npm run preview` serves it locally.

## Upload to GitHub
1. Create an empty repository at https://github.com/new (no README, no .gitignore).
2. In the project folder run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Skycast weather app"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
`.gitignore` already excludes `node_modules` and `dist`.

## Deploy to Vercel
**From GitHub (recommended)**
1. Sign in at https://vercel.com with your GitHub account.
2. Click **Add New… → Project** and import your repository.
3. Vercel detects Vite from `vercel.json`. Leave the defaults (build `npm run build`, output `dist`).
4. Click **Deploy**. You get an `https://<name>.vercel.app` URL. Every push to `main` redeploys.

**From the CLI**
```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

No environment variables are needed. Browser location access only works on `https` (Vercel provides it) or `localhost`.

## Project structure
```
index.html, vite.config.js, vercel.json, package.json
src/
  main.jsx, App.jsx, styles.css
  api.js       API calls and error handling
  utils.js     weather codes, unit conversion, AQI scales, formatting
  components/  Scene, Search, Chart, Current, Forecast, AirQuality, History
```

## Troubleshooting
- **Location blocked:** allow location for the site in the browser’s address-bar settings, then press “My location”.
- **“Can’t reach the weather service”:** check your connection or any ad-blocker that may block `open-meteo.com`.
- **Air quality shows “not available”:** coverage can be missing for some remote spots. The rest of the dashboard still works.
