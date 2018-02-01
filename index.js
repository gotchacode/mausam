#! /usr/bin/env node

const https = require('https');
const http = require('http');
const geoipURI = `https://telize.j3ss.co/geoip`;
const APIKEY = process.env.WUNDER_KEY || '6d0b4cdd7d6d8a5e';

function urlBuilder(type, location) {
  return `http://api.wunderground.com/api/${APIKEY}/${type}/q/${location.lat},${location.lng}.json`;
}

const weatherFetch = () => {
  https.get(geoipURI, (res) => {
    const { statusCode } = res;
    let error;
    if (statusCode !== 200) {
      error = new Error('Request Failed');
    }

    if (error) {
      console.log(error.message);
      res.resume();
      return;
    }

    res.setEncoding('utf8');

    let rawData = '';

    res.on('data', (chunk) => { rawData += chunk; });
    res.on('end', () => {
      try {
        const parsedData = JSON.parse(rawData);
        let location = {
          lat: parsedData.latitude,
          lng: parsedData.longitude
        };
        const weatherURL = urlBuilder('conditions/forecast/astronomy', location);
        http.get(weatherURL, (res) => {
          const { statusCode } = res;
          let error;
          const contentType = res.headers['content-type'];
          if (statusCode !== 200) {
            error = new Error('Request failed to complete');
          } else if (!/^application\/json/.test(contentType)) {
            error = new Error('Invalid content-type.\n' +
                              `Expected application/json but received ${contentType}`);
          }

          if (error) {
            console.log(error.message);
            res.resume();
            return;
          }

          res.setEncoding('utf8');
          let rawWeatherData = '';

          res.on('data', (chunk) => { rawWeatherData += chunk; });
          res.on('end', () => {
            try {
              const weatherData = JSON.parse(rawWeatherData);
              renderWeather(weatherData.current_observation);
            } catch (e) {
              console.log(e.message);
            }
          });


        });
      } catch(e) {
        console.log(e.message);
      }
    });
  });
};

const renderWeather = (data) => {
  // console.log(data);
  let locationAndTime = `Showing current weather in ${data.display_location.full} at ${data.observation_time_rfc822}.`
  let temperature = `- The temperature is ${data.temp_c}°C and feels like ${data.feelslike_c}°C`;
  let humidity = `- The humidity is ${data.relative_humidity}`;
  let windSpeed = `- The wind is ${data.wind_string} and blowing at a speed of ${data.wind_kph} km/hrs from ${data.wind_dir}`;
  let visibility = `- The visibility is ${data.visibility_km} kms`;
  const pressure = `- Current pressure is ${data.pressure_mb} mbar`;
  const precipiation = `- There is a ${data.precip_today_metric}% chance of rain today`;
  let developerAdvice = `We are using a free version of the weather API. It is recommended that you go ahead and register your own API key else we will hit rate-limits. https://www.wunderground.com/weather/api.\n`;
  let apiUsage = `Once you have the API key, run: export WUNDER_KEY='api_key_from_wundergrond'`;
  console.log('\n');
  console.log(locationAndTime);
  console.log('\n');
  console.log(temperature);
  console.log(humidity);
  console.log(windSpeed);
  console.log(visibility);
  console.log(pressure);
  console.log(precipiation);
  console.log('\n');
  console.log(`Powered by: ${data.image.title}`);
  console.log(`Link: ${data.image.link}`);
  console.log('\n');
  if (!process.env.WUNDER_KEY) {
    console.log(developerAdvice);
    console.log(apiUsage);
  }
};

const [,, ...args] = process.argv;
args.forEach( (argument) => {
  if (argument === "--help" || argument === "-h") {
    let developerAdvice = `We are using a free version of the weather API. It is recommended that you go ahead and register your own API key else we will hit rate-limits. https://www.wunderground.com/weather/api.\n`;
    let apiUsage = `Once you have the API key, run: export WUNDER_KEY='api_key_from_wundergrond'`;
    console.log('Usage: Rum `mausam` on your terminal\n');
    console.log(developerAdvice);
    console.log(apiUsage);
  }   
});

if (args.length === 0) {
  weatherFetch();
}
